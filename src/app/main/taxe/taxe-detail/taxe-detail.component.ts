
import { Component, OnInit ,ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {Taxe, TaxeRequest} from "../taxe.model";
import {TaxeDetailService} from "./taxe-detail.service";
import {TaxeNewService} from "../taxe-new/taxe-new.service";
import {Transporteur} from "../../transporteur/transporteur.model";
import {Departement} from "../../departement/departement.model";
import {TarifAffNewService} from "../../tarif-aff/tarif-aff-new/tarif-aff-new.service";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
@Component({
  selector: 'app-taxe-detail',
  templateUrl: './taxe-detail.component.html',
  styleUrls: ['./taxe-detail.component.scss']
})
export class TaxeDetailComponent implements OnInit {


    transporteurId : number;
    departementId : number;






    public hasRole: String[] = [];

    public edit: boolean;
    public data: Taxe;
    public taxeRequest: TaxeRequest;
    public contentHeader: object;

    public ReactivePasswordConfirmationForm: FormGroup;
    public ReactiveCPFormSubmitted = false;

    public CPForm = {
        password: ''
    };

    @ViewChild('taxeForm') taxeForm: NgForm;

    private _unsubscribeAll: Subject<any>;
    departements: any[] = [];
    transporteurs: any[] =[];



    constructor(
        private _taxeDetailService: TaxeDetailService,
        private modalService: NgbModal,
        private _authenticationService: AuthenticationService,
        private _authService: AuthenticationService,
        private formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _taxeNewService: TarifAffNewService,
        private http: HttpClient
    ) {
        this._unsubscribeAll = new Subject();
        this.edit = _taxeDetailService.editable;
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
                            this._taxeDetailService.deleteTaxe().subscribe(
                                res => {
                                    Swal.fire(
                                        {
                                            position: 'top-end',
                                            icon: 'success',
                                            title: 'Supprimé!',
                                            html: 'le taxe à été supprimé.',
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
            console.log(form)
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

                            this.taxeRequest = {
                                "id": this.data.id,

                                "transporteurId": this.data.transporteur.id,
                                "departementId": this.data.departement.id,
                                "taxName": this.data.taxName,
                                "taxValue": this.data.taxValue,
                                "letter": this.data.letter,
                                "taxType": this.data.taxType,
                                "fromDate": this.data.fromDate,
                                "toDate": this.data.toDate,



                            };
                            console.log(this.transporteurId);
                            console.log(this.departementId);


                            this._taxeDetailService.updateTaxe(this.taxeRequest).subscribe(
                                response => {
                                    console.log(this.taxeRequest)
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

                                            this._router.navigate([`taxe/list`]);
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
        this._taxeNewService.getDepartements().subscribe((data: any[]) => {
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
        this._taxeNewService.getTransporteurs().subscribe((data: any[]) => {
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

        this._taxeDetailService.onTaxeDetailChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                response => {
                    this.data = response;
                    console.log(response)
                }
            );



        this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

        this.ReactivePasswordConfirmationForm = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(4)]],
        });

        this._taxeDetailService.onTaxeDetailChanged
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
                        link: '/taxe/list'
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


    protected readonly console = console;
}
