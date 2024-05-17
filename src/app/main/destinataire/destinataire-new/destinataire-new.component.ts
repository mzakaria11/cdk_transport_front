import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import Swal from 'sweetalert2';
import { Destinataire } from '../destinataire.model';
import { DestinataireNewService } from './destinataire-new.service';

@Component({
  selector: 'app-destinataire-new',
  templateUrl: './destinataire-new.component.html',
  styleUrls: ['./destinataire-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DestinataireNewComponent implements OnInit {

    transporteurs: any[] = [];
    public a : any;
    public b : boolean = true;



  public contentHeader: Object;

  public data: Destinataire;

  public ReactiveDestinataireForm: UntypedFormGroup;
  public ReactiveDestinataireFormSubmitted = false;

  public DestinataireForm = {
    telephone: '',
    nom: '',
    commentaire: '',
    codeUM: '',
    email: '',
    delaiPeremption: '',
    departement: '',
    adresseLivraison: '',
    adresselivraisonRue: '',
    adresselivraisonCodepostal: '',
    adresselivraisonLocalite: '',
    adresseFacturation: '',
    adresselivraisonNom: '',
    adresselivraisonNumero: '',
    adresselivraisonComplement1: '',
    adresselivraisonComplement2: '',
    pays: ''
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _destinataireNewService: DestinataireNewService,
    private _router: Router
  ) { 
    this.data = new Destinataire();
  }

  get GetReactiveDestinataireForm() {
    return this.ReactiveDestinataireForm.controls;
  }

    do(b){
        if (b == true){
            b = false;
        }
        else {
            b = true;
        }
    }

  ReactiveDestinataireFormOnSubmit() {
    this.ReactiveDestinataireFormSubmitted = true;

    if (this.ReactiveDestinataireForm.invalid) {
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
          let form = this.ReactiveDestinataireForm.value;   
          
          let body = {          
            "adresseLivraison": form.nom + '  ' + form.adresselivraisonNumero  + '  ' + form.adresselivraisonRue+ '  ' + form.adresselivraisonComplement1  + '  ' + form.adresselivraisonCodepostal + '  ' + form.adresselivraisonLocalite,
            "telephone": form.telephone, 
            "nom": form.nom, 
            "commentaire": form.commentaire, 
            "codeUM": form.codeUM,
            "email": form.email, 
            "adresseFacturation": form.adresseFacturation, 
            "departement": form.departement, 
            "adresselivraisonNom": form.nom, 
            "adresselivraisonNumero": form.adresselivraisonNumero, 
            "adresselivraisonRue": form.adresselivraisonRue, 
            "adresselivraisonComplement1": form.adresselivraisonComplement1, 
            "adresselivraisonComplement2": form.adresselivraisonComplement2, 
            "adresselivraisonCodepostal": form.adresselivraisonCodepostal, 
            "adresselivraisonLocalite": form.adresselivraisonLocalite, 
            "delaiPeremption": form.delaiPeremption, 
            "idPays": form.pays
          }   
          console.log(body);

          this._destinataireNewService.addDestinataire(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: `Destinataire à été bien enregistrer.`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._router.navigate(['/destinataires/list'])
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
            'Rien n\'a été ajouté',
            'error'
          );
        }
      }
    );
  }

  ngOnInit(): void {
    this.ReactiveDestinataireForm = this.formBuilder.group(
      {
        telephone: ['', Validators.required],
        nom: ['', Validators.required],
        commentaire: [''],
        codeUM: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        delaiPeremption: [120, Validators.required],
        departement: [''],
        adresselivraisonRue: [''],
        adresseLivraison: [''],
        adresselivraisonCodepostal: ['', Validators.required],
        adresselivraisonLocalite: [''],
        adresseFacturation: [''],
        adresselivraisonNom: [''],
        adresselivraisonNumero: [''],
        adresselivraisonComplement1: [''],
        adresselivraisonComplement2: [''],
        pays: [1],
      }
    );


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
            name: 'Destinataires',
            isLink: true,
            link: '/destinataires/list'
          },
          {
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };
  }
}
