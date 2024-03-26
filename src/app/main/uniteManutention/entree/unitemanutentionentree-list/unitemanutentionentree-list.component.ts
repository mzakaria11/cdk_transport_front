import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { takeUntil } from 'rxjs/operators';
import { UnitemanutentionentreeDetailService } from '../unitemanutentionentree-detail/unitemanutentionentree-detail.service';
import { UmeListDTO, UmeRequest } from '../ume.model';
import { ZoneDepot } from 'app/main/zoneDepot/zonedepot.model';
import { ZonedepotListService } from 'app/main/zoneDepot/zonedepot-list/zonedepot-list.service';
import { UnitemanutentionentreeListService } from './unitemanutentionentree-list.service';
import { DocumentService } from 'app/main/documents/document.service';

@Component({
  selector: 'app-unitemanutentionentree-list',
  templateUrl: './unitemanutentionentree-list.component.html',
  styleUrls: ['./unitemanutentionentree-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UnitemanutentionentreeListComponent implements OnInit { 
    //#region Var Declaration
  
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
    
    public umes: UmeListDTO[];
    public temp: UmeListDTO[];
  
    public request: UmeRequest;
  
    public zones: ZoneDepot[];
    
    public searchValue = '';
  
    public dateStartP;
    public dateEndP;
  
    public dateStartR;
    public dateEndR;
    public operation: string;
    
    public twoMonth: Date = new Date();
    public fourMonth: Date = new Date();
  
    public ColumnMode = ColumnMode;
    @ViewChild(DatatableComponent) table: DatatableComponent;
  
    private _unsubscribeAll: Subject<any>;
  
    //#endregion
  
    constructor(
      private _umeListService: UnitemanutentionentreeListService,
      private _zoneListService: ZonedepotListService,
      private _authenticationService: AuthenticationService,
      private _umeDetailService: UnitemanutentionentreeDetailService,
      private _documentService: DocumentService,
      private formBuilder: UntypedFormBuilder,
      private modalService: NgbModal
    ) { 
      this.request = new UmeRequest();
      this.request.page.limit = this.currentPageLimit;
      this._unsubscribeAll = new Subject();
      this.twoMonth = this.twoMonth.setMonth(new Date().getMonth() + 2) as any as Date;    
      this.fourMonth = this.fourMonth.setMonth(new Date().getMonth() + 4) as any as Date;    
    }

    exportToExcel() {
      this._umeListService.exportToExcel()
        .subscribe(
          (blobData: Blob) => this._documentService.saveFile(blobData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "stock.xlsx"),
          () => {
            Swal.fire(
              {
                text: "Aucun fichier n'a été exporté !",
                icon: 'warning',
                confirmButtonText: 'OK'
              }
            )
          }
      );
    }
    
    //#region DATA TABBLE
  
    filterUpdate(event) {
      const val = event.target.value.toLowerCase();
      
      const temp = this.temp.filter(function (d) {
        return !isNaN(d.id) && d.id === parseInt(val)
        || (d.ble + '').toLowerCase().indexOf(val) !== -1 
        || (d.article + '').toLowerCase().indexOf(val) !== -1 
        || (d.zone + '').toLowerCase().indexOf(val) !== -1 
        || (d.numeroLot + '').toLowerCase().indexOf(val) !== -1 
        || !val;
      });
  
      this.umes = temp;
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
      this._umeListService.getUmesDataRows(this.request).then(
        (response: any) => {        
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;
  
          this.umes = response.dataVM;
          this.temp = this.umes;
        }
      );
    }
  
    clear() {
      this.request.idUme = null;
      this.request.article = null;
      this.request.ble = null;
      this.request.dateStartP = null;
      this.request.dateEndP = null;
      this.request.dateEndR = null;
      this.request.dateStartR = null;
      this.request.numeroLot = null;
      this.request.zone = null;
      this.request.operation = null;
      this.request.qte = null;
      
      this.operation = null;
      this.dateStartP = null;
      this.dateEndP = null;
      this.dateEndR = null;
      this.dateStartR = null;
  
      this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
    }
  
    search() {   
      if (this.operation) {
        const signe = this.operation.charAt(0);
    
        this.request.operation = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
        this.request.qte = this.request.operation === 'equal' ? parseInt(this.operation) : parseInt(this.operation.slice(1));
      }
  
      this.request.dateStartP = this.dateStartP ? new Date(this.dateStartP).getTime() / 1000 : null;
      this.request.dateEndP = this.dateEndP ? new Date(this.dateEndP).getTime() / 1000 : null;
  
      this.request.dateStartR = this.dateStartR ? new Date(this.dateStartR).getTime() / 1000 : null;
      this.request.dateEndR = this.dateEndR ? new Date(this.dateEndR).getTime() / 1000 : null;    
  
      this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
    }
  
    onSort(event) {
      const dir = event.sorts[0].dir;
      const col = event.sorts[0].prop ;
  
      this.request.sort = `&sort=${col},${dir}`;
  
      this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  
    }
  
    //#endregion
  
    //#region DELETE UME
  
    public umeSelected: number;
  
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
                this._umeDetailService.deleteUme(this.umeSelected).subscribe(
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
                        this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
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
      this.umeSelected = id;
    }
  
    //#endregion
  
    //#region HOOKS
  
    ngOnInit(): void {
      this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
     
      this.ReactivePasswordConfirmationForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(4)]],
      });
  
      this._zoneListService.getZONEsDataRows().then(
        (response: any) => {               
          this.zones = response;
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
              name: 'Ume',
              isLink: false
            }
          ]
        }
      };
  
      this._umeListService.onUmeListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (response: any) => {
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;
          this.umes = response.dataVM;        
          this.temp = this.umes;
        }
      );  
    }
  
    ngOnDestroy(): void {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
      this.request = undefined;
    }
  
    //#endregion
  
  }