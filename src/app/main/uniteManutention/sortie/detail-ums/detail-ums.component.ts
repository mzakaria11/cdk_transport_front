import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 

import { RepartitionListService } from 'app/main/repartition/repartition-list/repartition-list.service';
import { ColisList, ColisListRequest, UMS } from '../ums.model';
import { AuthenticationService } from 'app/auth/service';
import { DetailUmsService } from './detail-ums.service';
import { DocumentService } from 'app/main/documents/document.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-detail-ums',
  templateUrl: './detail-ums.component.html',
  styleUrls: ['./detail-ums.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DetailUmsComponent implements OnInit {

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
  
  public stat: any[] = [
    { name: 'Confirmé', id: 'confirmer' },
    { name: 'Non confirmé', id: 'nconfirmer' },
  ];

  public ums: UMS;

  public umsColis: ColisList[];
  public temp: ColisList[];

  public request: ColisListRequest;
  public edit: boolean;
   
  public dateOuverture: string;
  public dateFermeture: string;
  public dateExpedition: string;

  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _umsDetailService: DetailUmsService,
    private _authenticationService: AuthenticationService,
    private _documentService: DocumentService,
    private _router: Router,
    private modalService: NgbModal
  ) { 
    this.edit = _umsDetailService.editable;
    
    this.request = new ColisListRequest();
    this.request.page.limit = this.currentPageLimit;

    this._unsubscribeAll = new Subject();
  }

  navigation() {
    this._router.navigate([`/ums/edit/${this.ums.id}`]);
  }

  generateTicket(type: string) {
    this._documentService.generateUmsTicket(type, [this.ums.id])
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

  //#region Load DATA

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
    this._umsDetailService.getColisListDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;       
                
        this.umsColis = response.data as ColisList[];
        this.temp = this.umsColis;
      }
    );
  }

  clear() {
    this.request.article = null;
    this.request.stat = null;
    this.request.idColis = null;
    this.request.numerotation = null;
    this.request.lot = null;

    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {      
    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;
    this.request.sort = `&sort=${col},${dir}`;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion 

  //#region forms update and delete

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
              this._umsDetailService.delete().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'UME à été supprimé!',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/ume/list']);
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

  submit(form) {    
    if (form.valid) {     
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
            let body = {     
              id: this.ums.id,
              dateExpedition: this.dateExpedition ? new Date(this.dateExpedition).getTime() / 1000 : null, 
              poidsBrut: form.value.poidsBrut, 
            }; 
                                      
            this._umsDetailService.update(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `Les données de l'UMS on été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  res => {
                    this._router.navigate([`/ums/detail/${response.id}`])
                  }
                )
              },
              err => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  footer: `<p>${err}</p>`
                })
              }
            );
          } 
          else if ( result.dismiss === Swal.DismissReason.cancel ) 
          {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    }
  }
  
  closeUms(form) {     
    if (form.valid) {     
      let confirmed = this.ums.colisList.filter(el => { return el.emplacementConfirme != null});
  
      if (confirmed.length  == 0) {
        Swal.fire(
          'Aucun colis confirmé',
          'Rien n\'a été modifié',
          'error'
        );
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
          confirmButtonText: 'Oui, modifiez-le!',
          cancelButtonText: 'Non, annulez!',
          reverseButtons: true
        }
      )
      .then(
        (result) => {       
          if (result.isConfirmed) {              
            let body = {     
              id: this.ums.id,
              idBcs: this.ums.bcs.id,
              numero: this.ums.numero,
              poidsBrut: form.value.poidsBrut
            };            
            console.log(body);
            
            this._umsDetailService.closeUms(body).subscribe(
              () => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Clôture!',
                    html: `L'UMS a été clôturée avec succès`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this._umsDetailService.getUMSApiData();
                    this.reloadTable();
                  }
                );
              },
              err => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  footer: `<p>${err}</p>`
                })
              }
            );
          } 
          else if ( result.dismiss === Swal.DismissReason.cancel ) 
          {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    } 
  }

  //#endregion

  //#region HOOKS

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
    
    this._umsDetailService.onUMSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.ums = response;

        this.dateOuverture = formatDate(new Date(this.ums.dateOuverture), 'yyyy-MM-dd', "en");
        this.dateFermeture = this.ums.dateFermeture ? formatDate(new Date(this.ums.dateFermeture), 'yyyy-MM-dd', "en") : null;       
        this.dateExpedition = this.ums.dateExpedition ? formatDate(new Date(this.ums.dateExpedition), 'yyyy-MM-dd', "en") : undefined;
      }
    );     

    this._umsDetailService.getColisListDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;       
        
        this.umsColis = response.data as ColisList[];
        this.temp = this.umsColis;
      }
    );
    
    let title = `${this.edit ? 'Modification' : 'Détail'} d'UMS ${this.ums.id} N° ${this.ums.numero}`;

    this.contentHeader = {
      headerTitle: 'Unité manutention sortie',
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
            isLink: true,
            link: '/ums/list'
          },
          {
            name: title,
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
