import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {TarifMss} from "../tarif-mss.model";
import {TarifMssNewService} from "./tarif-mss-new.service";
import {Departement} from "../../departement/departement.model";
import {formatDate} from "@angular/common";
import {FileUploader} from "ng2-file-upload";
import {ColumnMode} from "@swimlane/ngx-datatable";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-tarif-mss-new',
  templateUrl: './tarif-mss-new.component.html',
  styleUrls: ['./tarif-mss-new.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class TarifMssNewComponent implements OnInit {

  public contentHeader: Object;

  public data: TarifMss;

  public ReactiveTarifMssForm: UntypedFormGroup;
  public ReactiveTmssFormSubmitted = false;
  departements: any[] = [];
  transporteurs: any[] =[];
  public selectedTransporteur: any;


  public TmssForm = {
    transporteur: '',
    departement: '',
    minKg: '',
    maxKg: '',
    prix: ''

  };

    public tmssFichier: FileUploader = new FileUploader( { isHTML5: true } );
    public tmssFileName = "choisir un fichier";
    private tmssFileExist=  false;

    file: any;

    constructor(
      private formBuilder: UntypedFormBuilder,
      private _router: Router,
      private _tarifMssNewService: TarifMssNewService,
      private http : HttpClient
  ) {


    this.data = new TarifMss();
  }

  get ReactiveTmssForm() {
    return this.ReactiveTarifMssForm.controls;
  }

  ReactiveTmssFormOnSubmit() {
    this.ReactiveTmssFormSubmitted = true;

    if (this.ReactiveTarifMssForm.invalid) {
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
                let form = this.ReactiveTarifMssForm.value;

                let body = {
                  transporteur: this.transporteurs.find(obj => obj.id === form.transporteur),
                  departement: this.transporteurs.find(obj => obj.id === form.departement),
                  minKg : form.minKg,
                  maxKg : form.maxKg,
                  prix : form.prix

                }

                this._tarifMssNewService.addTarifMss(body).subscribe(
                    response => {
                      Swal.fire(
                          {
                            position: 'top-end',
                            icon: 'success',
                            title: 'Ajouté!',
                            html: `la TarifMss du transporteur${response.transporteur} à été bien ajouté.`,
                            showConfirmButton: false,
                            timer: 1500
                          }
                      ).then(
                          () => {
                            this._router.navigate(['/tarifmss/list'])
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
        this._tarifMssNewService.getDepartements().subscribe((data: any[]) => {
            this.departements = data.map(dep => ({
                id: dep.id,
                name: dep.nom
                // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.departements)
        });
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                name: trans.nom // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.transporteurs)
        });

    }










    //file part

    onTmssFileSelected() {
        const length = this.tmssFichier?.queue?.length;

        this.tmssFileName = this.tmssFichier?.queue[length - 1]?._file.name;

        if (!this.tmssFileName.toLocaleLowerCase().includes("tmss")) {
            Swal.fire(
                'Ops',
                'Le fichier importé doit être un fichier tmss',
                'error'
            );
            this.tmssFichier.queue = [];
            this.tmssFileName = 'choisir un fichier';

            return;
        }

        this._tarifMssNewService.checkFiles("tmss", this.tmssFileName).subscribe(
            response => {
                if (response) {
                    this.tmssFileExist = true;
                }
            }
        );
    }



    vider(type: any) {
        if (type == "tmss") {
            this.tmssFichier = new FileUploader( { isHTML5: true } );
            this.tmssFileName = 'choisir un fichier';
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
                        formData.append('file', this.file, this.file.name);
                        this.http.post<any>('http://localhost:8080/api/tarifmss/upload-excel', formData)
                            .subscribe(
                                response => {
                                    console.log(response);

                                    Swal.fire(

                                        {
                                            position: 'top-end',
                                            icon: 'success',
                                            title: 'Ajouté!',
                                            html: `la TarifMss du transporteur${response.transporteur} à été bien ajouté.`,
                                            showConfirmButton: false,
                                            timer: 1500
                                        }
                                    ).then(
                                        () => {


                                            this._router.navigate(['/tarifmss/list'])
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

    public selectedFileName: string | null = null; // To store the selected file name

    public uploader: FileUploader = new FileUploader({ url: 'URL_WHERE_FILES_ARE_TO_BE_UPLOADED' });

    public hasBaseDropZoneOver: boolean = false;
    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

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

            this.http.post(`${environment.api}/tarifmss/upload-excel`, formData).subscribe(
                response => {
                    console.log('Upload successful', response);
                    this._router.navigate([`tarifmss/list`])
                },
                error => {
                    console.error('Upload error', error);
                }
            );
        } else {
            console.error('No file selected');
        }
    }
    //file part


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
            name: 'TarifMss',
            isLink: true,
            link: '/TarifMss/list'
          },
          {
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };

    this.ReactiveTarifMssForm = this.formBuilder.group(
        {

          transporteur: ['', Validators.required],
          departement: ['', Validators.required],
          minKg : ['', Validators.required],
          maxKg : ['', Validators.required],
          prix : ['', Validators.required],

        }
    );
  }

    protected readonly ColumnMode = ColumnMode;
    protected readonly document = document;
}

