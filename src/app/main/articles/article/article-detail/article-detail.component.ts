import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Role } from 'app/auth/models';
import { AuthenticationService } from 'app/auth/service';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Article } from '../article.model';
import { ArticleDetailService } from './article-detail.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {

  public hasRole: String[] = [];
  public article: Article;

  public contentHeader: Object;
  public edit: boolean;

  public selectedOption = 25;
  public ColumnMode = ColumnMode;

  public fournisseurs: Fournisseur[];

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  @ViewChild('articleForm') articleForm: NgForm;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private router: Router, 
    private _authenticationService: AuthenticationService,
    private _articleDetailService: ArticleDetailService,
    private _fournisseurListService: FournisseurListService,
    private _authService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
  ) { 
    this.edit = _articleDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

  get ReactiveCPForm() {
    return this.ReactivePasswordConfirmationForm.controls;
  }

  //#region submit

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

          this._authService.checkPassword(password).subscribe(
            res => {
              this._articleDetailService.deleteArticle().subscribe(
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
                      this._router.navigate(['/articles/list']);
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

  modalOpenForm(modalForm) {
    this.modalService.open(modalForm);
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
            console.log(form.value);
            
            let body = {
              "id": this.article.id,
              "codeFournisseur": (form.value as Article).codeClient,
              "codeClient": (form.value as Article).codeClient,
              "designationFournisseur": (form.value as Article).designationClient,
              "designationClient": (form.value as Article).designationClient,
              "dureeStockage": this.article.dureeStockage,
              "delaiPeremption": (form.value as Article).delaiPeremption,
              "quantiteColisStandard": (form.value as Article).quantiteColisStandard,
              "quantiteColisStockComplet": this.article.quantiteColisStockComplet,
              "quantiteProduitStockComplet": this.article.quantiteProduitStockComplet,
              "stock": this.article.stock,
              "poidsColisStandard": (form.value as Article).poidsColisStandard,
              "quantiteUniteManutentionSortie": this.article.quantiteUniteManutentionSortie,
              "quantiteColisStockIncomplet": this.article.quantiteColisStockIncomplet,
              "quantiteProduitStockIncomplet": this.article.quantiteProduitStockIncomplet,
              "idFournisseur": form.value.fournisseur 
            };
          
            this._articleDetailService.updateArticle(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `les données de l'article ${response.designationFournisseur} on été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  res => {
                    // this._articleDetailService.getApiData(this.article.id);
                    this.router.navigate([`/articles/detail/${this.article.id}`]);
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
              'rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    }
  }

  updateNav() {
    this._router.navigate([`/articles/edit/${this.article.id}`]);
  }

  //#endregion

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._articleDetailService.onArticleDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        console.log(response);
        
        this.article = response;
      }
    );      
    
    let title = this.edit ? 'Modification' : 'Détail';

    this.contentHeader = {
      headerTitle: title,
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
            name: 'Articles',
            isLink: true,
            link: '/articles/list'
          },
          {
            name: this.article.designationClient,
            isLink: false
          }
        ]
      }
    };

    this._fournisseurListService.getFournisseur().subscribe(
      response => {       
        this.fournisseurs = response;        
      }
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
