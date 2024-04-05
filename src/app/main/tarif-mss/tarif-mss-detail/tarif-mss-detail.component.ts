import { Component, OnInit ,ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {TarifMss, TarifMssRequest} from "../tarif-mss.model";
import {TarifMssDetailService} from "./tarif-mss-detail.service";
import {TarifMssNewService} from "../tarif-mss-new/tarif-mss-new.service";
import {Transporteur} from "../../transporteur/transporteur.model";
import {Departement} from "../../departement/departement.model";
import {TarifAffNewService} from "../../tarif-aff/tarif-aff-new/tarif-aff-new.service";

@Component({
  selector: 'app-tarif-mss-detail',
  templateUrl: './tarif-mss-detail.component.html',
  styleUrls: ['./tarif-mss-detail.component.scss']
})
export class TarifMssDetailComponent implements OnInit {



    transporteurId : number;
    departementId : number;






  public hasRole: String[] = [];

  public edit: boolean;
  public data: TarifMss;
  public tarifMssRequest: TarifMssRequest;
  public contentHeader: object;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  @ViewChild('tarifMssForm') tarifMssForm: NgForm;

  private _unsubscribeAll: Subject<any>;
  departements: any[] = [];
  transporteurs: any[] =[];



    constructor(
        private _tarifMssDetailService: TarifMssDetailService,
        private modalService: NgbModal,
        private _authenticationService: AuthenticationService,
        private _authService: AuthenticationService,
        private formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _tarifMssNewService: TarifAffNewService
    ) {
        this._unsubscribeAll = new Subject();
        this.edit = _tarifMssDetailService.editable;
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
                  this._tarifMssDetailService.deleteTarifMss().subscribe(
                      res => {
                        Swal.fire(
                            {
                              position: 'top-end',
                              icon: 'success',
                              title: 'Supprimé!',
                              html: 'le tarifMss à été supprimé.',
                              showConfirmButton: false,
                              timer: 1500
                            }
                        ).then(
                            () => {
                              this._router.navigate(['/taxe/list']);
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
                  let idPays = form.value.pays == -1 ? 1 : parseInt(form.value.pays);

                    console.log("transporteurs:", this.transporteurs);
                    console.log("departements:", this.departements);
                    console.log("data.id:", this.data.id);

                    this.tarifMssRequest = {
                    "id": this.data.id,

                    "transporteurId": this.transporteurId,
                    "departementId": this.departementId,
                    "minKg": form.value.minKg,
                    "maxKg": form.value.maxKg,
                    "prix": form.value.prix,

                  };
                    console.log(this.transporteurId);
                    console.log(this.departementId);


                  this._tarifMssDetailService.updateTarifMss(this.tarifMssRequest).subscribe(
                      response => {
                          console.log(this.tarifMssRequest)
                          console.log("n")
                        Swal.fire(
                            {
                              position: 'top-end',
                              icon: 'success',
                              title: 'Modifiées!',
                              html: `les données de ${response.transporteur.nom} on été bien modifiées.`,
                              showConfirmButton: false,
                              timer: 1500
                            }
                        ).then(
                            () => {

                              this._router.navigate([`tarifmss/detail/${this.data.id}`]);
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
                      'rien n\'a été modifié',
                      'error'
                  );
                }
              }
          );
    }
  }

  modalOpenForm(modalForm) {
    this.modalService.open(modalForm);
  }

    loadDepartements() {
        this._tarifMssNewService.getDepartements().subscribe((data: any[]) => {
            this.departements = data.map(dep => ({
                id: dep.id,
                numDepartement: dep.numDepartement,
                nom: dep.nom,
                prix: dep.prix
                // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.departements)
        });
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                nom: trans.nom,
                email: trans.email,
                telephone: trans.telephone,
                address: trans.adress,// Assuming each object has an 'id' and 'name' property
            }));

            console.log(this.transporteurs)
        });

    }





    ngOnInit(): void {

        this.loadDepartements();
        this.loadTransporteurs();





    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._tarifMssDetailService.onTarifMssDetailChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
            response => {
              this.data = response;
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
            name: 'Tarif Messagerie',
            isLink: true,
            link: '/tarifmss/list'
          },
          {
            name: this.data.transporteur,
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

