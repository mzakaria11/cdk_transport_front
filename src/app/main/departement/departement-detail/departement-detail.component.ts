import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/auth/service';
import Swal from 'sweetalert2';
import {Departement} from "../departement.model";
import {DepartementDetailService} from "./departement-detail.service";

@Component({
  selector: 'app-departement-detail',
  templateUrl: './departement-detail.component.html',
  styleUrls: ['./departement-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DepartementDetailComponent implements OnInit {

  public hasRole: String[] = [];
  private _unsubscribeAll: Subject<any>;
  public contentHeader: Object;

  public edit: boolean;
  public departement: Departement;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  @ViewChild('departementForm') departementForm: NgForm;


  constructor(
      private _departementDetailService: DepartementDetailService,
      private _authService: AuthenticationService,
      private modalService: NgbModal,
      private formBuilder: UntypedFormBuilder,
      private _router: Router,
  ) {
    this.edit = this._departementDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

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

            this._authService.checkPassword(password).subscribe(
                res => {
                  this._departementDetailService.deleteDepartement().subscribe(
                      res => {
                        Swal.fire(
                            {
                              position: 'top-end',
                              icon: 'success',
                              title: 'Supprimé!',
                              html: 'la departement à été supprimé.',
                              showConfirmButton: false,
                              timer: 1500
                            }
                        ).then(
                            () => {
                              this._router.navigate(['/departement/list']);
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
                  let body = this.departement;

                  this._departementDetailService.updateDepartement(body).subscribe(
                      response => {
                        Swal.fire(
                            {
                              position: 'top-end',
                              icon: 'success',
                              title: 'Modifiées!',
                              html: `les données de ${response.nom} on été bien modifiées.`,
                              showConfirmButton: false,
                              timer: 1500
                            }
                        ).then(
                            () => {

                                this._router.navigate([`departement/list`]);
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
    this._router.navigate([`/departement/edit/${this.departement.id}`]);


  }



  ngOnInit(): void {
    this.hasRole = this._authService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._departementDetailService.onDepartementDetailChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
            response => {
              this.departement = response;
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
            name: 'Departement',
            isLink: true,
            link: '/departement/list'
          },
          {
            name: this.departement.nom,
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

