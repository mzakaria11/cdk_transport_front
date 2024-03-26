import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'app/auth/service';
import { RepartitionListService } from './repartition-list.service';
import { RepartitionRequest } from '../repartition.model';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repartition-list',
  templateUrl: './repartition-list.component.html',
  styleUrls: ['./repartition-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepartitionListComponent implements OnInit {

  public hasRole: String[] = [];
  public contentHeader: Object;

  public currentPageLimit: number = 25;
  public currentPageLimitRep: number = 25;
  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
    { value: 500 },
  ];

  public cmds: any[];
  public repInProcess: any[];
  public temp: any[];
  public request: RepartitionRequest;
  
  public searchValue = '';
  public isExecut = false;
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _repartitonListService: RepartitionListService,
    private _authenticationService: AuthenticationService
  ) { 
    this.request = new RepartitionRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  repartir() {
    Swal.fire(
      {
        title: 'Êtes-vous sûr?',
        text: "Vous ne pourrez pas revenir en arrière!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui!'
      }
    )
    .then(
      async (result) => {
        if (result.isConfirmed) {
          let timeStart = new Date();

          this._repartitonListService.startScript().subscribe(
            response => {

              let min = new Date().getMinutes() - timeStart.getMinutes()
              let sec = new Date().getSeconds() - timeStart.getSeconds() 

              if (sec < 0) {
                sec += 60;
                min -= 1;
              }
              
              Swal.fire(
                'Terminée!',
                `La répartition s\'est achevée avec succès dans ${min} min ${sec} sec`,
                'success'
              ).then(
                e => {
                  this.isExecut = false;
                                    
                  this.reloadTable();
                  this._repartitonListService.getRepInProcessDataRows();
                }
              );
            },
            error => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Quelque chose n'a pas fonctionné avec le script de répartition"
              }).then(
                () => this.isExecut = false
              );
            }
          );
        }
      }
    )
  }

  //#region Load Data

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    
    const temp = this.temp.filter(function (d) {
      return d.destinataire.codeUM.toLowerCase().indexOf(val) !== -1 ;
    });

    this.cmds = temp;
    this.table.offset = 0;
  }

  onSizeChange(size) {           
    this.request.page.size = size;
    this.request.page.limit = size;
    this.pageCallback({ offset: 0, pageSize: size, limit: size})
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {            
    this.request.page.offset = pageInfo.offset;
    this.reloadTable();
  }

  reloadTable() {
    this._repartitonListService.getRepartitionDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.cmds = response.data as any[];
        this.temp = this.cmds;
      }
    );
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;

    this.request.dir = col.includes("destinataire.codeUM") ? dir : undefined;
    this.request.sort = !this.request.dir ? `&sort=${col},${dir}` : '';    

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion

  //#region Hooks

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
   
    this._repartitonListService.onRepartitionChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        // console.log(response);

        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.cmds = response.data;
        this.temp = this.cmds;
        
      }
    ); 
   
    this._repartitonListService.onRepInProcessChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        console.log(response);

        this.repInProcess = response;        
      }
    ); 

    this.contentHeader = {
      headerTitle: 'Liste',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Accueil',
            isLink: true,
            link: '/'
          },
          {
            name: 'Repartition',
            isLink: false
          }
        ]
      }
    }; 
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }

  //#endregion

}

