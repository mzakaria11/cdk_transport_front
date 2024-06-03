import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Destinataire } from '../destinataire.model';
import { DestinataireNewService } from './destinataire-new.service';
import {TarifAffNewService} from "../../tarif-aff/tarif-aff-new/tarif-aff-new.service";

@Component({
    selector: 'app-destinataire-new',
    templateUrl: './destinataire-new.component.html',
    styleUrls: ['./destinataire-new.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DestinataireNewComponent implements OnInit {

    public contentHeader: Object;
    public data: Destinataire;
    public ReactiveDestinataireForm: UntypedFormGroup;
    public ReactiveDestinataireFormSubmitted = false;
    public departements: Array<{ id: number, name: string }> = [];

    constructor(
        private formBuilder: UntypedFormBuilder,
        private _destinataireNewService: DestinataireNewService,
        private _router: Router,
        private _tarifAffNewService: TarifAffNewService,
    ) {
        this.data = new Destinataire();
    }

    get GetReactiveDestinataireForm() {
        return this.ReactiveDestinataireForm.controls;
    }

    loadDepartements() {
        this._tarifAffNewService.getDepartements().subscribe((data: any[]) => {
            this.departements = data.map(dep => ({
                id: dep.id,
                name: dep.nom
            }));
            console.log(this.departements);
        });
    }

    ReactiveDestinataireFormOnSubmit() {
        this.ReactiveDestinataireFormSubmitted = true;

        if (this.ReactiveDestinataireForm.invalid) {
            return;
        }

        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger sup'
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Vous êtes sûr ?',
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, ajoutez-le!',
            cancelButtonText: 'Non, annulez!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                let form = this.ReactiveDestinataireForm.value;

                let body: any = {
                    "adresseLivraison": form.nom + '  ' + form.adresselivraisonNumero  + '  ' + form.adresselivraisonRue+ '  ' + form.adresselivraisonComplement1  + '  ' + form.adresselivraisonCodepostal + '  ' + form.adresselivraisonLocalite,
                    "telephone": form.telephone,
                    "nom": form.nom,
                    "commentaire": form.commentaire,
                    "codeUM": form.codeUM,
                    "email": form.email,
                    "adresseFacturation": form.adresseFacturation,
                    "idDepartement": form.departement,
                    "adresselivraisonNom": form.nom,
                    "adresselivraisonNumero": form.adresselivraisonNumero,
                    "adresselivraisonRue": form.adresselivraisonRue,
                    "adresselivraisonComplement1": form.adresselivraisonComplement1,
                    "adresselivraisonComplement2": form.adresselivraisonComplement2,
                    "adresselivraisonCodepostal": form.adresselivraisonCodepostal,
                    "adresselivraisonLocalite": form.adresselivraisonLocalite,
                    "delaiPeremption": form.delaiPeremption,
                    "idPays": form.pays,
                    "isAffretement": form.isAffretement,
                    "isMessagerie": form.isMessagerie
                }

                if (form.isDelta) {
                    body.delta = form.delta;
                }

                console.log(body);

                this._destinataireNewService.addDestinataire(body).subscribe(
                    response => {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Ajouté!',
                            html: `Destinataire à été bien enregistrer.`,
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            console.log(body);
                        });
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

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Annulé',
                    'Rien n\'a été ajouté',
                    'error'
                );
            }
        });
    }

    ngOnInit(): void {
        this.ReactiveDestinataireForm = this.formBuilder.group({
            telephone: ['', Validators.required],
            nom: ['', Validators.required],
            commentaire: [''],
            codeUM: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            delaiPeremption: [120, Validators.required],
            departement: ['', Validators.required],
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
            isAffretement: [false],
            isMessagerie: [false],
            isDelta: [false],
            delta: ['']
        });

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

        // Load departements data
        this.loadDepartements();

        // Set up the behavior for the isAffretement and isMessagerie checkboxes
        this.ReactiveDestinataireForm.get('isAffretement').valueChanges.subscribe(value => {
            if (value) {
                this.ReactiveDestinataireForm.get('isMessagerie').setValue(false);
            }
        });

        this.ReactiveDestinataireForm.get('isMessagerie').valueChanges.subscribe(value => {
            if (value) {
                this.ReactiveDestinataireForm.get('isAffretement').setValue(false);
            }
        });

        // Set up the behavior for the isDelta checkbox
        this.ReactiveDestinataireForm.get('isDelta').valueChanges.subscribe(value => {
            if (value) {
                this.ReactiveDestinataireForm.get('delta').setValidators([Validators.required]);
            } else {
                this.ReactiveDestinataireForm.get('delta').clearValidators();
            }
            this.ReactiveDestinataireForm.get('delta').updateValueAndValidity();
        });
    }
}
