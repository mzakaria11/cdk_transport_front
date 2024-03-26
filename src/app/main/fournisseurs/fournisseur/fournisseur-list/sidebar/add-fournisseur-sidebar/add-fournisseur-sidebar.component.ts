import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import Swal from 'sweetalert2';
import { Fournisseur } from '../../../fournisseur.model';
import { FournisseurListService } from '../../fournisseur-list.service';

@Component({
  selector: 'app-add-fournisseur-sidebar',
  templateUrl: './add-fournisseur-sidebar.component.html'
})
export class AddFournisseurSidebarComponent implements OnInit {

  public ReactiveFournisseurForm: UntypedFormGroup;
  public ReactiveFournisseurFormSubmitted = false;

  public FournisseurForm = {
    nom: '',
    email: '',
    telephone: '',
    adresse: ''
  };

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private formBuilder: UntypedFormBuilder,
    private _fournisseurListService: FournisseurListService 
  ) { }

  get getReactiveFournisseurForm() {
    return this.ReactiveFournisseurForm.controls;
  }

  ReactiveFournisseurFormOnSubmit() {   
    this.ReactiveFournisseurFormSubmitted = true;

    if (this.ReactiveFournisseurForm.invalid) {
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
          let form = this.ReactiveFournisseurForm.value;   

          let body: Fournisseur = {
            nom: form.nom,
            adresse: form.adresse,
            telephone: form.telephone,
            email: form.email
          }

          console.log(body);
          
          this._fournisseurListService.addFournisseur(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: `le fournisseur ${response.nom} à été bien ajouté.`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                r => {
                  this.toggleSidebar('add-fournisseur-sidebar');
                  this._fournisseurListService.getFournisseursDataRows();
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

    this.ReactiveFournisseurForm = this.formBuilder.group(
      {
        nom: ['', Validators.required],
        email: ['', [Validators.required]],
        telephone: ['', [Validators.required]],
        adresse: ['', [Validators.required]]
      }
    );
  }

  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }
  
}
