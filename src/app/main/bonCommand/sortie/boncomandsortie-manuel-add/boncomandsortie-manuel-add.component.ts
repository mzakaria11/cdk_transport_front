import { formatDate } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { Article } from 'app/main/articles/article/article.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { Destinataire } from 'app/main/destinataire/destinataire.model';
import { repeaterAnimation } from 'app/main/forms/form-repeater/form-repeater.animation';
import Swal from 'sweetalert2';
import { BoncommandsortieNewService } from '../boncommandsortie-new/boncommandsortie-new.service';
import { Router } from '@angular/router';

class BcsForm {
  codeDestinataire: String;
  numeroCommande: String;
  dateCommande: string = formatDate(new Date(), 'yyyy-MM-dd', "en");
  codeArticle: String;
  qteColis: String;
}
@Component({
  selector: 'app-boncomandsortie-manuel-add',
  templateUrl: './boncomandsortie-manuel-add.component.html',
  styleUrls: ['./boncomandsortie-manuel-add.component.scss'],
  animations: [repeaterAnimation],
  encapsulation: ViewEncapsulation.None
})
export class BoncomandsortieManuelAddComponent implements OnInit {

  public contentHeader: object; 
  public destinataires: Destinataire[];
  public articles: Article[];
  
  public lignes: BcsForm[] = [new BcsForm()];

  public bcs: BcsForm = new BcsForm();

  constructor(
    private _destinataireListService: DestinataireListService,
    private _bcsNewService: BoncommandsortieNewService,
    private _articleListService: ArticleListService,
    private _router: Router
  ) { }

  syncLigne() {
    const lignes = this.lignes[this.lignes.length  - 1];

    lignes.codeDestinataire = this.bcs.codeDestinataire;
    lignes.numeroCommande = this.bcs.numeroCommande;
    lignes.dateCommande = this.bcs.dateCommande
  }

  addLigne(bcsForm: any) {
    if (bcsForm.form.valid === true) {       

      
      let bc = new BcsForm();
      bc.codeDestinataire = this.bcs.codeDestinataire;
      bc.numeroCommande = this.bcs.numeroCommande;
      bc.dateCommande = this.bcs.dateCommande;
      
      this.lignes.push(bc);
    } else {
      Swal.fire(
        'Ops',
        'Tous les champs doivent être remplis',
        'error'
      );
    }
  }

  deleteLigne(id) {
    for (let i = 0; i < this.lignes.length; i++) {
      if (this.lignes.indexOf(this.lignes[i]) === id) {
        this.lignes.splice(i, 1);
        break;
      }
    }
  }

  submit(bcsForm) {
    if (bcsForm.form.valid) {
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
            console.log(this.lignes);
            console.log(12);
      
            const body = [this.lignes[0]];
      
            this._bcsNewService.importBcsToDB(body).subscribe( 
              response => {
                console.log(response);
                
                this._bcsNewService.importLigneBcsToDB(this.lignes).subscribe( 
                  res => {
                    Swal.fire({ 
                      position: 'top-end', 
                      icon: 'success', 
                      title: 'Bon de commande à été ajoutées avec succès', 
                      showConfirmButton: false, 
                      timer: 1500 
                    }).then(
                      () => {
                        this._router.navigate([`/bcs/detail/${response[0].id}`])
                      }
                    ); 
                  },
                  ({error}) => {
                    let msg = (error.error_message + "").split('Exception: ')[1];
                    Swal.fire({
                      icon: 'error',
                      title: 'Oops...',
                      text: msg
                    });
                  }
                ); 
              },
              ({error}) => {
                let msg = error ? (error.error_message + "").split('Exception: ')[1] : 'erreur';
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: msg
                });
              }
            );
          }
        }
      );
      return;
    }

    Swal.fire(
      'Ops',
      'Tous les champs doivent être remplis',
      'error'
    );
  }

  ngOnInit(): void {
    this.contentHeader = { 
      headerTitle: 'Bon de commande sortie', 
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
            name: 'Ajouter', 
            isLink: false 
          } 
        ] 
      } 
    }; 

    this._destinataireListService.getDestinatairesDataRows().then(
      (response: any) => {
        console.log(response);
        
        this.destinataires = response.data;
      }
    );
    
    this._articleListService.getAllArticlesDataRows().then(
      (response: any) => {      
        this.articles = response;
      }
    );
  }

}
