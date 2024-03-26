import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {Departement} from "../departement.model";
import{DepartementNewService} from "./departement-new.service";

@Component({
    selector: 'app-departement-new',
    templateUrl: './departement-new.component.html',
    styleUrls: ['./departement-new.component.scss'],

  encapsulation: ViewEncapsulation.None
})
export class DepartementNewComponent implements OnInit {

  public contentHeader: Object;

  public data: Departement;

  public ReactiveDepartementForm: UntypedFormGroup;
  public ReactiveDrFormSubmitted = false;

  public DrForm = {
      numDepartement: '',
      nom: ''

  };

  constructor(
      private formBuilder: UntypedFormBuilder,
      private _router: Router,
      private _departementNewService: DepartementNewService
  ) {
    this.data = new Departement();
  }

  get ReactiveDrForm() {
    return this.ReactiveDepartementForm.controls;
  }

  ReactiveDrFormOnSubmit() {
    this.ReactiveDrFormSubmitted = true;

    if (this.ReactiveDepartementForm.invalid) {
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
                let form = this.ReactiveDepartementForm.value;

                let body: Departement = {
                    numDepartement: form.numDepartement,
                    nom: form.nom

                }

                this._departementNewService.addDepartement(body).subscribe(
                    response => {
                      Swal.fire(
                          {
                            position: 'top-end',
                            icon: 'success',
                            title: 'Ajouté!',
                            html: `la Departement ${response.nom} à été bien ajouté.`,
                            showConfirmButton: false,
                            timer: 1500
                          }
                      ).then(
                          () => {
                            this._router.navigate(['/departement/list'])
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
                    'la departement n\'a pas été ajouté',
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
            link: '/departement/list'
          },
          {
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };

    this.ReactiveDepartementForm = this.formBuilder.group(
        {
            numDepartement: ['', Validators.required],
            nom: ['', Validators.required]

        }
    );
  }

}

