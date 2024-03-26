import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Destinataire } from 'app/main/destinataire/destinataire.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { formatDate } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { APiResponse } from 'app/api-response';
import { UMS, UmsRequest } from '../ums.model';
import { UnitemanutentionsortieListService } from '../unitemanutentionsortie-list/unitemanutentionsortie-list.service';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
import { UnitemanutentionsortieDetailService } from '../unitemanutentionsortie-detail/unitemanutentionsortie-detail.service';
import { DocumentService } from 'app/main/documents/document.service';
import { HttpResponse } from '@angular/common/http';
pdfMake.vfs = pdfFonts.pdfMake.vfs; 

@Component({
  selector: 'app-unitemanutentionsortie-list',
  templateUrl: './unitemanutentionsortie-list.component.html',
  styleUrls: ['./unitemanutentionsortie-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UnitemanutentionsortieListComponent implements OnInit {
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

  public editingPoids = {};

  public umss: UMS[];
  public temp: UMS[];
  public destinataires: Destinataire[];
  public request: UmsRequest;

  public selectedUms: any[] = [];
  public selectedStat: {name: string, id: string};
  public massActionSelection: number = 0;
  public operation: string;
  
  public searchValue = '';
  
  public stats: any[] = [
    { name: 'Tous', id: null },
    { name: 'À fermer', id: 'fermer' },
    { name: 'Prêt à être expédié', id: 'expedie' }
  ];

  public dateOuverture: {
    start: any,
    end: any
  } = { start: '', end: ''};
  
  public dateFermeture: {
    start: any,
    end: any
  } = { start: '', end: ''};
  
  public dateExpedition: {
    start: any,
    end: any
  } = { start: '', end: ''};
  
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _umsListService: UnitemanutentionsortieListService,
    private _umsDetailService: UnitemanutentionsortieDetailService,
    private _destinataireListService: DestinataireListService,
    private _authenticationService: AuthenticationService,
    private _documentService: DocumentService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new UmsRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  generatePdf(type:string, ums: UMS) {
    if (type === 'umsTicket' && !ums.poidsBrut) {
      Swal.fire(
        {
          title: 'Êtes-vous sûr ?',
          text: "Cet ums n'a pas de poids, voulez-vous l'imprimer ? ",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#28C76F',
          confirmButtonText: 'Oui'
        }
      )    
      .then(
        (result) => {      
          if (result.isConfirmed) {          
            this.selectedUms.push(ums);            
            this.generateTicket(type);
          }
        }
      );
    } else {
      this.selectedUms.push(ums);     
      this.generateTicket(type);
    }
  }

  closeSelectedUms() {
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
        confirmButtonText: 'Oui, modifiez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
    .then(
      (result) => {       
        if (result.isConfirmed) {  
          let u = this.selectedUms.find(({poidsBrut}) => !poidsBrut );
          
          if (u) {
            Swal.fire(
              {
                icon: 'info',
                title: 'Oops...',
                text: `Ajouter le poids pour UMS ${u.id} !`,
              }
            ).then(
              () => {
                this.massActionSelection = 0;
              }
            );
          } else {
            let body: any[] = [];
            this.selectedUms.forEach(
              el => {
                if (!el.dateFermeture) {
                  body.push(
                    {
                      id: el.id,
                      idBcs: el.bcs.id,
                      numero: el.numero,
                      poidsBrut: el.poidsBrut,
                      confirmAll: true
                    }
                  );
                }
              } 
            );

            this._umsListService.closeUmsOnMass(body).subscribe(
              (response) => {
                let results: any[] = response;

                let alert: any = {
                  icon: 'success',
                  title: 'Modifiées!',
                  html: 'Les données des UMS sélectionné on été bien modifiées.'
                };

                if (results.length > 0) 
                {
                  console.log(results);
                  let ids = results.map(({id}) => id).join(",");
                  alert.html += ` Sauf pour les UMS suivants qui ont des colis non confirmés. ${ids}`;
                } 
                else 
                {
                  alert.position = 'top-end';
                  alert.showConfirmButton = false;
                  alert.timer = 1500;
                }

                Swal.fire(alert).then(
                  () => {
                    this.selectedUms = [];
                    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
                    this.massActionSelection = 0;
                  }
                );
              },
              err => {          
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  footer: `<p>${err}</p>`
                });
              }
            );       
          }
        } 
        else if ( result.dismiss === Swal.DismissReason.cancel ) 
        {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'Rien n\'a été modifié',
            'error'
          );
        }
      }
    );  
  }

  generateTicket(type: string) {
    const res = new Promise<any>(
      resolve => {
        const ids = type === "umsTicket" 
          ? this.selectedUms.filter(({poidsBrut}) => poidsBrut > 0).map(({id}) => id) 
          : this.selectedUms.map(({id}) => id) 
        ;

        this._documentService.generateUmsTicket(type, ids)
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
            ) 
          }
        );

        setTimeout(resolve, 1);
      }
    );

    res.then(() => { this.massActionSelection = 0; this.selectedUms = [] });
  }
  
  umsOnSelect({ selected }) {
    this.selectedUms.splice(0, this.selectedUms.length);
    this.selectedUms.push(...selected);
  }

  async onSelectChange() {
    if (this.selectedUms.length > 0) {
      if (
        this.massActionSelection == 1
      ) {
        this.closeSelectedUms();
      } 
      else if (
        this.massActionSelection == 2
      ) {        
        this.generateTicket("umsTicket");
      } 
      else if(
        this.massActionSelection == 3
        ) {
        this.generateTicket("colisageUms");
      }
    } else {   
      Swal.fire(
        {
          icon: 'info',
          title: 'Oops...',
          text: 'Vous devez selectionner au moins une UMS!',
        }
      ).then(
        e => {
          this.massActionSelection = 0;
        }
      );
    }
  }

  inlineEditingUpdatePoids(event, cell, rowIndex) {
    this.editingPoids[rowIndex + '-' + cell] = false;
    this.umss[rowIndex][cell] = event.target.value;
    this.umss = [...this.umss];
  }

  //#region DATA TABBLE

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return !isNaN(d.id) && d.id === parseInt(val)
      || !isNaN(d.numero) && d.numero === parseInt(val)
      || (d.poidsBrut + '').toLowerCase().indexOf(val) !== -1 
      || (d.bcs.destinataire.codeUM + '').toLowerCase().indexOf(val) !== -1 
      || (d.bcs.destinataire.nom + '').toLowerCase().indexOf(val) !== -1 
      || !val;
    });

    this.umss = temp;
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
    this._umsListService.getUmsDataRows(this.request).then(
      (response: APiResponse) => {        
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.umss = response.data;
        this.temp = this.umss;
      }
    );
  }

  clear() {
    this.request.destinataire = null;
    this.request.stat = null;
    this.request.operation = null;
    this.operation = null;
    this.request.poid = null;

    this.request.dateStartOuv = null;
    this.request.dateEndOuv = null;
    this.dateOuverture.start = null;
    this.dateOuverture.end = null;

    this.request.dateStartFer = null;
    this.request.dateEndFer = null;
    this.dateFermeture.start = null;
    this.dateFermeture.end = null;

    this.request.dateStartExp = null;
    this.request.dateEndExp = null;
    this.dateExpedition.start = null;
    this.dateExpedition.end = null;
    
    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {   
    if (this.operation) {
      const signe = this.operation.charAt(0);
  
      this.request.operation = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
      this.request.poid = this.request.operation === 'equal' ? parseInt(this.operation) : parseInt(this.operation.slice(1));
    }

    this.request.dateStartOuv = this.dateOuverture.start ? new Date(this.dateOuverture.start).getTime() / 1000 : null;
    this.request.dateEndOuv = this.dateOuverture.end ? new Date(this.dateOuverture.end).getTime() / 1000 : null;

    this.request.dateStartFer = this.dateFermeture.start ? new Date(this.dateFermeture.start).getTime() / 1000 : null;
    this.request.dateEndFer = this.dateFermeture.end ? new Date(this.dateFermeture.end).getTime() / 1000 : null;

    this.request.dateStartExp = this.dateExpedition.start ? new Date(this.dateExpedition.start).getTime() / 1000 : null;
    this.request.dateEndExp = this.dateExpedition.end ? new Date(this.dateExpedition.end).getTime() / 1000 : null;

    this.request.stat = this.selectedStat?.id ?? null;   

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
      this._umsListService.getUmsDataRowsSortedByCodeUM(this.request).then(
        (response) => {          
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;
  
          this.umss = response.data as UMS[];
          this.temp = this.umss;
        }
      );
    }
  }

  //#endregion

  //#region DELETE UMs

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
            () => {
              this._umsDetailService.deleteUms(this.selectedUms).subscribe(
                () => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'L\'UMS à été supprimé.',
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
    this.selectedUms = id;
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
            name: 'Ums',
            isLink: false
          }
        ]
      }
    };

    this._umsListService.onUmsListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: APiResponse) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.umss = response.data;
        this.temp = this.umss;
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