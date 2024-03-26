import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Transporteur } from '../transporteur.model';
import { TransporteurNewService } from './transporteur-new.service';

@Component({
  selector: 'app-transporteur-new',
  templateUrl: './transporteur-new.component.html',
  styleUrls: ['./transporteur-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransporteurNewComponent implements OnInit {

  public contentHeader: Object;

  public data: Transporteur;

  public ReactiveTransporteurForm: UntypedFormGroup;
  public ReactiveTrFormSubmitted = false;

  public TrForm = {
    nom: '',
    email: '',
    telephone: '',
    address: ''
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _transporteurNewService: TransporteurNewService 
  ) { 
    this.data = new Transporteur();    
  }

  get ReactiveTrForm() {
    return this.ReactiveTransporteurForm.controls;
  }

  ReactiveTrFormOnSubmit() {
    this.ReactiveTrFormSubmitted = true;

    if (this.ReactiveTransporteurForm.invalid) {
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
          let form = this.ReactiveTransporteurForm.value;   

          let body: Transporteur = {
            nom: form.nom,
            email: form.email,
            address: form.address,
            telephone: form.telephone,
          }
                    
          this._transporteurNewService.addTransporteur(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: `le transporteur ${response.nom} à été bien ajouté.`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._router.navigate(['/transporteurs/list'])
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
            'le transporteur n\'a pas été ajouté',
            'error'
          );
        }
      }
    );
  }

  ngOnInit(): void {

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
            name: 'Transporteurs',
            isLink: true,
            link: '/transporteurs/list'
          },
          {
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };

    this.ReactiveTransporteurForm = this.formBuilder.group(
      {
        nom: ['', Validators.required],
        email: ['', Validators.required],
        address: ['', [Validators.required]],
        telephone: ['', [Validators.required]]
      }
    );
  }

}
