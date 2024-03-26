import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BLE } from '../ble.model';
import { BonlivraisonentreeDetailService } from './bonlivraisonentree-detail.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/auth/service';
import Swal from 'sweetalert2';
import { UnitemanutentionentreeDetailService } from 'app/main/uniteManutention/entree/unitemanutentionentree-detail/unitemanutentionentree-detail.service';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-bonlivraisonentree-detail',
  templateUrl: './bonlivraisonentree-detail.component.html',
  styleUrls: ['./bonlivraisonentree-detail.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
  encapsulation: ViewEncapsulation.None
})
export class BonlivraisonentreeDetailComponent implements OnInit {

  //#region Var

  public contentHeader: Object;
  private _unsubscribeAll: Subject<any>;

  public edit: boolean;

  public ColumnMode = ColumnMode;
  public selectedOption = 25;
  
  public lignes: any[];
  public ble: BLE;
  
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('bleForm') bleForm: NgForm;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };
  
  public hasRole: String[] = [];
  public dateReception: NgbDateStruct;

  public bleFichier: FileUploader = new FileUploader( { isHTML5: true } );
  public bleFileName = "choisir un fichier";

  //#endregion

  constructor(
    private _bleDetailService: BonlivraisonentreeDetailService,
    private _umeDetailService: UnitemanutentionentreeDetailService,
    private _authenticationService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
    private calendar: NgbCalendar
  ) { 
    this.dateReception = calendar.getToday();
    this.edit = _bleDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

  //#region  Upload file

  onLveFileSelected() {
    const length = this.bleFichier?.queue?.length;
    
    this.bleFileName = this.bleFichier?.queue[length - 1]?._file.name;

    if (!this.bleFileName.toLocaleLowerCase().includes("bl")) {
      Swal.fire(
        'Ops',
        'Le fichier importé doit être un fichier BL',
        'error'
      );

      this.bleFichier.queue = [];
      this.bleFileName = 'choisir un fichier';
    }   
  }

  upload() {
    let formData: FormData = new FormData();
    formData.append("file", this.bleFichier.queue[0]._file)

    try {
      const response = this._bleDetailService.uploadFile(formData).toPromise().then(
        () => {
          console.log('File upload successful'); 
          this._bleDetailService.updateBle({id: this.ble.id, fichier: this.bleFileName}).subscribe(
            () => {
              this._bleDetailService.getApiData(this.ble.id);
            }
          )     
          Swal.fire(
            {
              position: 'top-end',
              icon: 'success',
              title: 'Importé!',
              html: `Le fichier a été importé avec succès.`,
              showConfirmButton: false,
              timer: 1500
            }
          );
        }
      );
      return response;
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }

  vider() {
    this.bleFichier = new FileUploader( { isHTML5: true } );
    this.bleFileName = 'choisir un fichier'; 
  }

  //#endregion

  //#region  delete
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

          this._authenticationService.checkPassword(password).subscribe(
            res => {
              this._bleDetailService.deleteBle().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'BL à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/ble/list']);
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

  //#endregion

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
            let body = this.ble;
  
            this._bleDetailService.updateBle(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `BL ${response.numeroBonLivraison} a été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
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
              'Rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    }
  }

  openFile() {
    this._bleDetailService.getFile(this.ble.fichier).subscribe(
      (res: any) => {
        let array = new Uint8Array(res);
        let file = new Blob([array], { type: 'application/pdf' });
        let fileURL = URL.createObjectURL(file);
        window.open(fileURL)
      }
    )
  }

  navigate(url) {
    this._router.navigate([url]);
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._bleDetailService.onBLEDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.ble = response;
        console.log(this.ble);
                
        this.lignes = this.ble.lignes.sort((a, b) => a.numeroUme - b.numeroUme);

        this.dateReception = {
          day: new Date(this.ble.dateReception).getDate(),
          month: new Date(this.ble.dateReception).getUTCMonth() + 1,
          year: new Date(this.ble.dateReception).getUTCFullYear()
        };
      }
    ); 

    this.contentHeader = {
      headerTitle: 'Détail',
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
            name: 'Ble',
            isLink: true,
            link: '/ble/list'
          },
          {
            name: this.ble.numeroBonLivraison ?? '-',
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