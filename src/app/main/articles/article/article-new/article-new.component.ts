import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import Swal from 'sweetalert2';
import { ArticleNewService } from './article-new.service';

@Component({
  selector: 'app-article-new',
  templateUrl: './article-new.component.html',
  styleUrls: ['./article-new.component.scss']
})
export class ArticleNewComponent implements OnInit {

  public contentHeader: Object;

  public ReactiveArticlesForm: UntypedFormGroup;
  public ReactiveArticlesFormSubmitted = false;

  public ArticleForm = {
    codeFournisseur: '',
    designationFournisseur: '',
    dureeStockage: '',
    delaiPeremption: '',
    quantiteColisStandard: '',
    poidsColisStandard: '',
    fournisseurs: ''
  };

  public fournisseurs: Fournisseur[];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _articleNewService: ArticleNewService,
    private _fournisseurListService: FournisseurListService,
    private _router: Router
  ) {}

  get ReactiveArticleForm() {
    return this.ReactiveArticlesForm.controls;
  }

  ReactiveArticlesFormOnSubmit() {
    
    this.ReactiveArticlesFormSubmitted = true;
    
    if (this.ReactiveArticlesForm.invalid) {      
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
    )
    .then(
      (result) => {       
        if (result.isConfirmed) {  
          let form = this.ReactiveArticlesForm.value;   

          let body = {
            "codeFournisseur": form.codeFournisseur,
            "codeClient": form.codeFournisseur,
            "designationFournisseur": form.designationFournisseur,
            "designationClient": form.designationFournisseur,
            "dureeStockage": form['dureeStockage'],
            "delaiPeremption": form['delaiPeremption'],
            "quantiteColisStandard": form['quantiteColisStandard'],
            "quantiteColisStockComplet": 0,
            "quantiteProduitStockComplet": 0,
            "stock": 1,
            "poidsColisStandard": form['poidsColisStandard'],
            "quantiteUniteManutentionSortie": 0,
            "quantiteColisStockIncomplet": 0,
            "quantiteProduitStockIncomplet": 0,
            "idFournisseur": form.fournisseur
          };
          
          this._articleNewService.addArticle(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: 'l\'article a été ajouté.',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._router.navigate(['/articles/list'])
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
            'l\'article n\'a pas été ajouté',
            'error'
          );
        }
      }
    );

  }

  ngOnInit() {
    this.contentHeader = {
      headerTitle: 'Nouveau',
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
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };

    this.ReactiveArticlesForm = this.formBuilder.group(
      {
        codeFournisseur: ['', Validators.required],
        designationFournisseur: ['', Validators.required],
        dureeStockage: [''],
        delaiPeremption: [''],
        quantiteColisStandard: ['', Validators.required],
        poidsColisStandard: [''],
        fournisseur: ['', Validators.required],
      }
    );

    this._fournisseurListService.getFournisseur().subscribe(
      response => {       
        this.fournisseurs = response;        
      }
    );
  }
}
