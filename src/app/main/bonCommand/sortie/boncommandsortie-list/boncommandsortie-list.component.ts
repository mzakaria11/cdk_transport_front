import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { BCS, BcsRequest } from '../bcs.model';
import { Destinataire } from 'app/main/destinataire/destinataire.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { BoncommandsortieDetailService } from '../boncommandsortie-detail/boncommandsortie-detail.service';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
import { formatDate } from '@angular/common';
import { BoncommandsortieListService } from './boncommandsortie-list.service';
import { takeUntil } from 'rxjs/operators';
import { APiResponse } from 'app/api-response';
import { DocumentService } from 'app/main/documents/document.service';
import { HttpResponse } from '@angular/common/http';
pdfMake.vfs = pdfFonts.pdfMake.vfs; 

@Component({
  selector: 'app-boncommandsortie-list',
  templateUrl: './boncommandsortie-list.component.html',
  styleUrls: ['./boncommandsortie-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BoncommandsortieListComponent implements OnInit {

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
  
  public stats: any[] = [
    { name: 'Tous', id: null },
    { name: 'Traité', id: 'processed' },
    { name: 'En cours', id: 'inProcess' }
  ];
  public bcs: BCS[];
  public temp: BCS[];
  public destinataires: Destinataire[];
  public request: BcsRequest;
  
  public searchValue = '';
  public dateStart;
  public dateEnd;
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _bcsListService: BoncommandsortieListService,
    private _destinataireListService: DestinataireListService,
    private _authenticationService: AuthenticationService,
    private _bcsDetailService: BoncommandsortieDetailService,
    private _documentService: DocumentService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new BcsRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  //#region MASS ACTIONS

  public selectedBcs = [];
  public SelectionType = SelectionType;
  public massActionSelection: string = "";
  
  bcsOnSelect({ selected }) {
    this.selectedBcs.splice(0, this.selectedBcs.length);
    this.selectedBcs.push(...selected);
  }
  
  onSelectChange() {
    if (this.massActionSelection === "blsBcs") {
      this.generateBl();
    } 
  }

  generateBl(bcs?: BCS) {
    const ids = bcs ? [bcs.id] : this.selectedBcs.map(({id}) => id);

    this._documentService.generateBlsPdf('blsBcs', ids)
    .subscribe(
      (response: HttpResponse<Blob>) => {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        window.open(url, '_blank');
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

  //#endregion

  //#region DATA TABBLE

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return (d.numeroCommande + '').toLowerCase().indexOf(val) !== -1 
      || (d.destinataire.codeUM + '').toLowerCase().indexOf(val) !== -1 
      || (d.destinataire.nom + '').toLowerCase().indexOf(val) !== -1 
      || !val;
    });

    this.bcs = temp;
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
    this._bcsListService.getBcsDataRows(this.request).then(
      (response: APiResponse) => {        
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.bcs = response.data;
        this.temp = this.bcs;
      }
    );
  }

  clear() {
    this.request.numeroCommande = null;
    this.request.destinataire = null;
    this.request.termine = null;
    this.request.dateStart = null;
    this.request.dateEnd = null;
    this.dateStart = null;
    this.dateEnd = null;
    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {   
    this.request.dateStart = this.dateStart ? new Date(this.dateStart).getTime() / 1000 : null;
    this.request.dateEnd = this.dateEnd ? new Date(this.dateEnd).getTime() / 1000 : null;
    

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;

    if (col !== 'destinataire.codeUM') {
      this.request.sort = `&sort=${col},${dir}`;
      this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
    } else {
      
      this.request.dir = dir;
      this._bcsListService.getBcsDataRowsSortedByCodeUM(this.request).then(
        (response) => {          
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;
  
          this.bcs = response.data as BCS[];
          this.temp = this.bcs;
        }
      );
    }
  }

  //#endregion

  //#region DELETE BCS

  public bcsSelected: number;

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
              this._bcsDetailService.deleteBcs(this.bcsSelected).subscribe(
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
    this.bcsSelected = id;
  }

  //#endregion

  //#region HOOKS

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
   
    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._destinataireListService.getDestinataire().subscribe(
      response => {               
        this.destinataires = response['data'];
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
            name: 'Bcs',
            isLink: false
          }
        ]
      }
    };

    this._bcsListService.onBcsListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: APiResponse) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.bcs = response.data;
        this.temp = this.bcs;
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