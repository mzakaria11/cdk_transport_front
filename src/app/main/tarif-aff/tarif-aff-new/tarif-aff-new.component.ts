import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


const URL = 'https://your-url.com';

import {Departement} from "../../departement/departement.model";
import {formatDate} from "@angular/common";
import {FileUploader} from "ng2-file-upload";
import {ColumnMode} from "@swimlane/ngx-datatable";
import {HttpClient} from "@angular/common/http";
import {TarifAff} from "../tarif-aff.model";
import {TarifAffNewService} from "./tarif-aff-new.service";
import {environment} from "../../../../environments/environment";


@Component({
    selector: 'app-tarif-aff-new',
    templateUrl: './tarif-aff-new.component.html',
    styleUrls: ['./tarif-aff-new.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class TarifAffNewComponent implements OnInit {

    public contentHeader: Object;

    public data: TarifAff;
    transporteurId : number;

    public ReactiveTarifAffForm: UntypedFormGroup;
    public ReactiveTaffFormSubmitted = false;
    departements: any[] = [];
    transporteurs: any[] =[];

    public uploader: FileUploader = new FileUploader({ url: 'URL_WHERE_FILES_ARE_TO_BE_UPLOADED' });
    public hasBaseDropZoneOver: boolean = false;
    public selectedFileName: string | null = null; // To store the selected file name
    public selectedTransporteur: any; // Replace 'any' with your transporteur type



    public TaffForm = {
        transporteur: '',
        departement: '',
        nbrPalette: '',
        prix: ''

    };

    public taffFichier: FileUploader = new FileUploader( { isHTML5: true } );
    public taffFileName = "choisir un fichier";
    private taffFileExist=  false;

    file: any;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _tarifAffNewService: TarifAffNewService,
        private http : HttpClient

) {
        this.data = new TarifAff();
    }



    get ReactiveTaffForm() {
        return this.ReactiveTarifAffForm.controls;
    }

    ReactiveTaffFormOnSubmit() {
        this.ReactiveTaffFormSubmitted = true;

        if (this.ReactiveTarifAffForm.invalid) {
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
                        let form = this.ReactiveTarifAffForm.value;

                        let body = {
                            transporteur: this.transporteurs.find(obj => obj.id === form.transporteur),
                            departement: this.departements.find(obj => obj.id === form.departement),
                            nbrPalette : form.nbrPalette,

                            prix : form.prix

                        }

                        this._tarifAffNewService.addTarifAff(body).subscribe(
                            response => {
                                Swal.fire(
                                    {
                                        position: 'top-end',
                                        icon: 'success',
                                        title: 'Ajouté!',
                                        html: `la TarifAff du transporteur${response.transporteur} à été bien ajouté.`,
                                        showConfirmButton: false,
                                        timer: 1500
                                    }
                                ).then(
                                    () => {
                                        this._router.navigate(['/tarifaff/list'])
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
                            'la tarif mss  n\'a pas été ajouté',
                            'error'
                        );
                    }
                }
            );
    }

    loadDepartements() {
        this._tarifAffNewService.getDepartements().subscribe((data: any[]) => {
            this.departements = data.map(dep => ({
                id: dep.id,
                name: dep.nom
                // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.departements)
        });
    }

    loadTransporteurs() {
        this._tarifAffNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                name: trans.nom // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.transporteurs)
        });

    }










    //file part

    onTaffFileSelected() {
        const length = this.taffFichier?.queue?.length;

        this.taffFileName = this.taffFichier?.queue[length - 1]?._file.name;

        if (!this.taffFileName.toLocaleLowerCase().includes("taff")) {
            Swal.fire(
                'Ops',
                'Le fichier importé doit être un fichier taff',
                'error'
            );
            this.taffFichier.queue = [];
            this.taffFileName = 'choisir un fichier';

            return;
        }

        this._tarifAffNewService.checkFiles("taff", this.taffFileName).subscribe(
            response => {
                if (response) {
                    this.taffFileExist = true;
                }
            }
        );
    }



    vider(type: any) {
        if (type == "taff") {
            this.taffFichier = new FileUploader( { isHTML5: true } );
            this.taffFileName = 'choisir un fichier';
        }
    }






    uploadExcel() {
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


                        const formData = new FormData();
                        formData.append('file', this.file, this.file.name );
                        formData.append('transporteurId', "3" );
                        this.http.post<any>('http://localhost:8080/api/tarifaff/upload-excel', formData, )
                            .subscribe(
                                response => {
                                    console.log(response);

                                    Swal.fire(

                                        {
                                            position: 'top-end',
                                            icon: 'success',
                                            title: 'Ajouté!',
                                            html: `la tarifAff du transporteur${response.transporteur} à été bien ajouté.`,
                                            showConfirmButton: false,
                                            timer: 1500
                                        }
                                    ).then(
                                        () => {


                                            this._router.navigate(['/tarifaff/list'])
                                        }
                                    );
                                },
                                err => {
                                    console.log(err);
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
                            'la tarif mss  n\'a pas été ajouté',
                            'error'
                        );
                    }
                }
            );
    }



    // public
    public hasAnotherDropZoneOver: boolean = false;


    // Public Methods
    // -----------------------------------------------------------------------------------------------------
    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }


    // Adjusted to simply store the selected file in a property

    selectedFile: File | null = null;

    onFileChange(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];

            this.selectedFileName = this.selectedFile.name;
        }
    }
    // New method to upload the file when the button is clicked
    uploadFile(): void {
        if (this.selectedFile) {
            const formData: FormData = new FormData();
            formData.append('file', this.selectedFile, this.selectedFile.name);

            formData.append('transporteurId', this.selectedTransporteur.id);
            console.log(this.selectedTransporteur.id)

            this.http.post(`${environment.api}/tarifaff/upload-excel`, formData).subscribe(
                response => {
                    console.log('Upload successful', response);
                    this._router.navigate([`tarifaff/list`])
                },
                error => {
                    console.error('Upload error', error);
                }
            );
        } else {
            console.error('No file selected');
        }
    }


    ngOnInit(): void {
        this.loadDepartements();
        this.loadTransporteurs();

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
                        name: 'TarifAff',
                        isLink: true,
                        link: '/TarifAff/list'
                    },
                    {
                        name: 'Ajouter',
                        isLink: false
                    }
                ]
            }
        };

        this.ReactiveTarifAffForm = this.formBuilder.group(
            {

                transporteur: ['', Validators.required],
                departement: ['', Validators.required],
                nbrPalette : ['', Validators.required],
                prix : ['', Validators.required],

            }
        );
    }

    protected readonly ColumnMode = ColumnMode;
    protected readonly document = document;
}

