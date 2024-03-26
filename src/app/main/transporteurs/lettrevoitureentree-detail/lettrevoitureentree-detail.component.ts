import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { LVE } from '../lve.model';
import { LettrevoitureentreDetailService } from './lettrevoitureentre-detail.service';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { FileUploader } from 'ng2-file-upload';
import { LettrevoitureNewFormService } from '../lettrevoiture-new-form/lettrevoiture-new-form.service';

@Component({
  selector: 'app-lettrevoitureentree-detail',
  templateUrl: './lettrevoitureentree-detail.component.html',
  styleUrls: ['./lettrevoitureentree-detail.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
  encapsulation: ViewEncapsulation.None
})
export class LettrevoitureentreeDetailComponent implements OnInit {

  public hasRole: String[] = [];
  public contentHeader: Object;
  
  public rows;
  public ColumnMode = ColumnMode;
  public selectedOption = 25;
  
  public dateReception: NgbDateStruct;

  
  public edit: boolean;
  public data: LVE;
    
  public lveFichier: FileUploader = new FileUploader( { isHTML5: true } );
  public lveFileName = "choisir un fichier";

  private _unsubscribeAll: Subject<any>;

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _lveDetailService: LettrevoitureentreDetailService,
    private _authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private _router: Router,
    private calendar: NgbCalendar
  ) { 
    this.dateReception = calendar.getToday();
    this.edit = _lveDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

  onLveFileSelected() {
    const length = this.lveFichier?.queue?.length;
    
    this.lveFileName = this.lveFichier?.queue[length - 1]?._file.name;

    if (!this.lveFileName.toLocaleLowerCase().includes("lv")) {
      Swal.fire(
        'Ops',
        'Le fichier importé doit être un fichier LV',
        'error'
      );

      this.lveFichier.queue = [];
      this.lveFileName = 'choisir un fichier';
    }   
  }

  upload() {
    let formData: FormData = new FormData();
    formData.append("file", this.lveFichier.queue[0]._file)

    try {
      const response = this._lveDetailService.uploadFile(formData).toPromise().then(
        () => {
          console.log('File upload successful'); 
          this._lveDetailService.updateLve({id: this.data.id, fichier: this.lveFileName}).subscribe(
            () => {
              this._lveDetailService.getApiData(this.data.id);
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
    this.lveFichier = new FileUploader( { isHTML5: true } );
    this.lveFileName = 'choisir un fichier'; 
  }

  //#region delete
  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

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
              this._lveDetailService.deleteLve().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'LVE à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/lve/list']);
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
  
  openFile() {
    this._lveDetailService.getFile(this.data.fichier).subscribe(
      (res: any) => {
        let filename = this.data.fichier;

        let blob: Blob = res  .body as Blob;

        let array = new Uint8Array(res);

        let a = document.createElement('a');

        let file = new Blob([array], { type: 'application/pdf' });
        let fileURL = URL.createObjectURL(file);
        window.open(fileURL)

        // a.href = window.URL.createObjectURL(blob);
        // // a.download = filename as string;
        // a.target = '_blank';
        // a.click();

      }
    )
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._lveDetailService.onLVEDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.data = response;       
        this.rows = this.data.bles;

        this.dateReception = {
          day: new Date(this.data.dateReception).getDate(),
          month: new Date(this.data.dateReception).getUTCMonth() + 1,
          year: new Date(this.data.dateReception).getUTCFullYear()
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
            name: 'Lve',
            isLink: true,
            link: '/lve/list'
          },
          {
            name: this.data.numeroRecepisse,
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
