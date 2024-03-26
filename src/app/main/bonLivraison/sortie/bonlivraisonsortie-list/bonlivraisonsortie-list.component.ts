import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { takeUntil } from 'rxjs/operators';
import { APiResponse } from 'app/api-response';
import { BLS, BlsRequest } from '../bls.model';
import { BonlivraisonsortieDetailService } from '../bonlivraisonsortie-detail/bonlivraisonsortie-detail.service';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { Destinataire } from 'app/main/destinataire/destinataire.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { ScriptHistoryService } from 'app/main/script/script-history/script-history.service';
import { BonlivraisonsortieListService } from './bonlivraisonsortie-list.service';
import { DocumentService } from 'app/main/documents/document.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-bonlivraisonsortie-list',
  templateUrl: './bonlivraisonsortie-list.component.html',
  styleUrls: ['./bonlivraisonsortie-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BonlivraisonsortieListComponent implements OnInit {

  //#region Variable declarations

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
  
  public bls: BLS[];
  public temp: BLS[];
  public transporteurs: Transporteur[];
  public destinataires: Destinataire[];
  public request: BlsRequest;

  public dateStart;
  public dateEnd;

  public searchValue = '';
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _blsListService: BonlivraisonsortieListService,
    private _bleDetailService: BonlivraisonsortieDetailService,
    private _destinataireListService: DestinataireListService,
    private _authenticationService: AuthenticationService,
    private _scriptHistoryService: ScriptHistoryService,
    private _documentService: DocumentService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new BlsRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  public selectedBls = [];
  public SelectionType = SelectionType;
  public massActionSelection: string = "";
  
  blsOnSelect({ selected }) {
    this.selectedBls.splice(0, this.selectedBls.length);
    this.selectedBls.push(...selected);
  }
  
  onSelectChange() {
    if (this.massActionSelection === "blsBcs") {
      this.generateBl();
    } 
  }

  generateBl(bcs?: any) {
    const ids = bcs ? [bcs.id] : this.selectedBls.map(({bcs}) => bcs.id);

    this._documentService.generateBlsPdf('blsBcs', ids)
    .subscribe(
      (response: HttpResponse<Blob>) => {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        window.open(url, '_blank');
        this.selectedBls = [];
      },
      () => {
        Swal.fire(
          {
            text: "Aucun document n'a été généré !",
            icon: 'warning',
            confirmButtonText: 'OK'
          }
        );
      }
    );
  }

  //#region DATA TABLE

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    
    const temp = this.temp.filter(function (d) {
      return ( (d.numeroBonLivraison + '').toLowerCase().indexOf(val) !== -1 )
      || ( (d?.transporteur?.nom + '').toLowerCase().indexOf(val) !== -1 )
      || ( (d?.bcs?.destinataire?.codeUM + '').toLowerCase().indexOf(val) !== -1 )
      || ( (d?.bcs?.numeroCommande + '').toLowerCase().indexOf(val) !== -1 )
      || !val;
    });

    this.bls = temp;
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
    this._blsListService.getBlsDataRows(this.request).then(
      (response) => {
        console.log(response);
        
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;        
        this.bls = response.data;
        this.temp = this.bls;
      }
    );
  }

  clear() {
    this.request.numeroBl = null;
    this.request.destinataire = null;
    this.request.transporteur = null;
    this.request.dateDebut = null;
    this.request.dateFin = null;
    this.request.dir = null;
    this.dateStart = null;
    this.dateEnd = null;
    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {       
    this.request.dateDebut = this.dateStart ? new Date(this.dateStart).getTime() / 1000 : null;
    this.request.dateFin = this.dateEnd ? new Date(this.dateEnd).getTime() / 1000 : null;
    console.log(this.request);
    
    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;

    if (col !== 'bcs.destinataire.codeUM') {
      this.request.sort = `&sort=${col},${dir}`;
      this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
    } else {
      this.request.dir = dir;
      this._blsListService.getBlsDataRowsSortedByCodeUM(this.request).then(
        (response: APiResponse) => {          
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;
  
          this.bls = response.data;
          this.temp = this.bls;
        }
      );
    }
  }

  //#endregion

  //#region delete

  public blsSelected: number;

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
              this._bleDetailService.deleteBls(this.blsSelected).subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'BLS à été supprimé.',
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
    this.blsSelected = id;
  }

  //#endregion

  //#region  HOOKS

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
   
    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    // this._transporteurListService.getTransporteur().subscribe(
    //   (response: any) => {               
    //     this.transporteurs = response.data;
    //   }
    // );

    this._destinataireListService.getDestinataire().subscribe(
      (response: any) => {               
        this.destinataires = response.data;
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
            name: 'BL',
            isLink: false
          }
        ]
      }
    };

    this._blsListService.onBlsListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: APiResponse) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;
        this.bls = response.data;
        this.temp = this.bls;
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