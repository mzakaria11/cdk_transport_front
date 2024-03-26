import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { UnitemanutentionsortieDetailService } from 'app/main/uniteManutention/sortie/unitemanutentionsortie-detail/unitemanutentionsortie-detail.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { BCS } from '../bcs.model';
import { BoncommandsortieDetailService } from './boncommandsortie-detail.service';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
import { formatDate } from '@angular/common';
import { AuthenticationService } from 'app/auth/service';
pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { log } from 'console';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { Article } from 'app/main/articles/article/article.model';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ScriptHistoryService } from 'app/main/script/script-history/script-history.service';

@Component({
  selector: 'app-boncommandsortie-detail',
  templateUrl: './boncommandsortie-detail.component.html',
  styleUrls: ['./boncommandsortie-detail.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
  encapsulation: ViewEncapsulation.None
})
export class BoncommandsortieDetailComponent implements OnInit {

  public hasRole: String[] = [];
  public contentHeader: Object;
  
  public rows;
  public rowsBls: any[] = [];
  public rowsUms: any[] = [];
  public ColumnMode = ColumnMode;
  
  public selectedOption = 25;
  public selectedOptionBls = 10;
  public selectedOptionUms = 10;
  
  public edit: boolean;
  public bcs: BCS;
  public articles: Article[];
  
  public dateCommande: NgbDateStruct;

  private _unsubscribeAll: Subject<any>;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _bcsDetailService: BoncommandsortieDetailService,
    private _umsDetailService: UnitemanutentionsortieDetailService,
    private _articleList: ArticleListService,
    private _authenticationService: AuthenticationService,
    private _scriptHistoryService: ScriptHistoryService,
    private calendar: NgbCalendar,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.dateCommande = calendar.getToday();
    this.edit = _bcsDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

  //#region submits

  updateUmsDateExpedition() {
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
        confirmButtonText: 'Oui!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
    .then(
      (result) => {       
        if (result.isConfirmed) {  
          let body = {     
            idBcs: this.bcs.id
          };            
         
          this._umsDetailService.updateUmsDateExpedition(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Modification!',
                  html: `La date d'éxpedition d'UM a été modifier avec succès`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                res => {
                  this._bcsDetailService.getApiData(this.bcs.id);
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
            'Rien n\'a été modifié',
            'error'
          );
        }
      }
    ); 
  }

  confirmer(ligne?) {
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
          if (ligne) {
            let idUms = this.bcs.umsList.find(({dateFermeture}) => dateFermeture == null).id;
            
            this._bcsDetailService.confirmLignes(ligne.id, ligne.article.id, idUms).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: "Modification",
                    html: ligne.termine == 0 ? 'Confirmation réussie' : 'Confirmation annulée',
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  t => {
                    this._bcsDetailService.getApiData(this.bcs.id);
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
          } else {
            this._bcsDetailService.confirmAll(this.bcs.id).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modification!',
                    html: `Confirmation réussie`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  t => {
                    this._bcsDetailService.getApiData(this.bcs.id);
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
        } 
        else if ( result.dismiss === Swal.DismissReason.cancel ) 
        {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'Confirmation annulée',
            'error'
          );
        }
      }
    );
  }

  //#endregion

  //#region Ajouter ligne

  public ReactiveLigneForm: FormGroup;
  public ReactiveLigneFormSubmitted = false;

  public ligneForm = {
    article: '',
    qte: ''
  };

  get getReactiveLigneForm() {
    return this.ReactiveLigneForm.controls;
  }

  ReactiveLigneFormOnSubmit() {   
    this.ReactiveLigneFormSubmitted = true;

    if (this.ReactiveLigneForm.invalid) {
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
        confirmButtonText: 'Oui, ajoutez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          let form = this.ReactiveLigneForm.value;   

          let body = {
            codeArticle: form.article,
            numeroCommande: this.bcs.numeroCommande,
            qteColis: form.qte
          }

          console.log(body);

          this._bcsDetailService.addLigne(body).subscribe(
            () => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Modification!',
                  html: 'BCS a été Modifiée.',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._bcsDetailService.getApiData(this.bcs.id);
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
          
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'rien n\'a été ajouté',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()    
  }

  openModalLigne(modal) {
    this.modalService.open(modal);
  }

  //#endregion

  ngOnInit(): void {
    this.ReactiveLigneForm = this.formBuilder.group({
      article: ['', [Validators.required]],
      qte: ['', [Validators.required]],
    });

    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this._bcsDetailService.onBCSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {        
        this.bcs = response;
        console.log(this.bcs);
        
        this.rows = this.bcs.lignes;
        this.rowsBls = this.bcs.blsList;
        this.rowsUms = this.bcs.umsList;

        this.dateCommande = {
          day: new Date(this.bcs.dateCommande).getDate(),
          month: new Date(this.bcs.dateCommande).getUTCMonth() + 1,
          year: new Date(this.bcs.dateCommande).getUTCFullYear()
        };
      }
    );    

    this._articleList.getAllArticlesDataRows()
    .then(response => {       
      this.articles = response;      
    });

    this.contentHeader = {
      headerTitle: 'Détail',
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
            isLink: true,
            link: '/bcs/list'
          },
          {
            name: this.bcs.numeroCommande,
            isLink: false
          }
        ]
      }
    };
  }
  
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
