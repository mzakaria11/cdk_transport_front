import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import { TransporteurListService } from 'app/main/transporteur/transporteur-list/transporteur-list.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { LettrevoitureentreDetailService } from '../lettrevoitureentree-detail/lettrevoitureentre-detail.service';
import { LVE, LveRequest } from '../lve.model';
import { LettrevoitureentreListService } from './lettrevoitureentre-list.service';
import { formatDate } from '@angular/common';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { APiResponse } from 'app/api-response';

@Component({
  selector: 'app-lettrevoitureentree-list',
  templateUrl: './lettrevoitureentree-list.component.html',
  styleUrls: ['./lettrevoitureentree-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LettrevoitureentreeListComponent implements OnInit {

  public hasRole: String[] = [];
  public contentHeader: Object;

  public currentPageLimit: number = 25;
  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
    { value: 500 },
  ];

  public ColumnMode = ColumnMode;
  public request: LveRequest;
  public lves: any[];
  public transporteurs: Transporteur[];

  public dateStart;
  public dateEnd;

  public operationPalette: string;
  public operationColis: string;

  public searchValue = '';
  
  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  private temp: LVE[] = [];
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _lveListService: LettrevoitureentreListService,
    private _lveDetailService: LettrevoitureentreDetailService,
    private _authenticationService: AuthenticationService,
    private _transporteurListService: TransporteurListService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new LveRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  //#region DATATABLE 

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    
    const temp = this.temp.filter(function (d) {
      return ( (d.numeroRecepisse + '').toLowerCase().indexOf(val) !== -1 )
      || ( isNaN(val) && (d.transporteur.nom + '').toLowerCase().indexOf(val) !== -1 )
      || ( !isNaN(val) && d.quantitePalette == parseInt(val) )  
      || !val;
    });

    this.lves = temp;
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
    this._lveListService.getLvesDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;        
        this.lves = response.data as LVE[];
        this.temp = this.lves;
      }
    );
  }

  clear() {
    this.request.transporteur = null;

    this.request.operationPalette = null;
    this.request.qtePalette = null;
    this.operationPalette = null;
    
    this.request.operationColis = null;
    this.request.qteColis = null;
    this.operationColis = null;

    this.request.dateReceptionDebut = null;
    this.request.dateReceptionFin = null;

    this.dateStart = null;
    this.dateEnd = null;

    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {
    if (this.operationPalette) {
      const signe = this.operationPalette.charAt(0);
      this.request.operationPalette = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
      this.request.qtePalette = this.request.operationPalette === 'equal' ? parseInt(this.operationPalette) : parseInt(this.operationPalette.slice(1));
    }

    if (this.operationColis) {
      const signe = this.operationColis.charAt(0);
      this.request.operationColis = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
      this.request.qteColis = this.request.operationColis === 'equal' ? parseInt(this.operationColis) : parseInt(this.operationColis.slice(1));
    }
        
    this.request.dateReceptionDebut = this.dateStart ? new Date(this.dateStart).getTime() / 1000 : null;
    this.request.dateReceptionFin = this.dateEnd ? new Date(this.dateEnd).getTime() / 1000 : null;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;
    this.request.sort = `&sort=${col},${dir}`;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion

  //#region delete
  public lveSelected: number;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  get ReactiveCPForm() {
    return this.ReactivePasswordConfirmationForm.controls;
  }

  ReactiveCPFormOnSubmit() {
    this.ReactiveCPFormSubmitted = true;

    if (this.ReactivePasswordConfirmationForm.invalid) {
      return;
    }
    
    const swalWithBootstrapButtons = Swal.mixin(
      {
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger sup'
        },
        buttonsStyling: false
      }
    );
    
    swalWithBootstrapButtons.fire(
      {
        title: 'Vous êtes sûr ?',
        text: "Vous ne pourrez pas revenir en arrière !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          const password = this.ReactivePasswordConfirmationForm.value.password;
          
          this._authenticationService.checkPassword(password).subscribe(
            res => {
              this._lveDetailService.deleteLve(this.lveSelected).subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'l\'article à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this.pageCallback({ offset: 0});
                    }
                  );
                } 
              );
            },
            error => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Il y a eu un problème!',
                footer: `<p>${error.error}</p>`
              })
            }
          );
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'rien n\'a été supprimé',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()    
  }

  modalOpenForm(modalForm, id) {
    this.modalService.open(modalForm);    
    this.lveSelected = id;
  }

  //#endregion

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
   
    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

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
            name: 'Lettres de voiture entrée',
            isLink: false
          }
        ]
      }
    };

    this._transporteurListService.getTransporteur().subscribe(
      (response: any) => {             
        console.log(response);
        
        this.transporteurs = response.data;
      }
    );

    this._lveListService.onLVEListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: APiResponse) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;
        this.lves = response.data;
        this.temp = this.lves;
      }
    );  

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }
}
