import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransporteurListService } from 'app/main/transporteur/transporteur-list/transporteur-list.service';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { FlatpickrOptions } from 'ng2-flatpickr';
import Swal from 'sweetalert2';
import { LVE } from '../lve.model';
import { LettrevoitureentreNewService } from './lettrevoitureentre-new.service';
import { FileUploader } from 'ng2-file-upload';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';

@Component({
  selector: 'app-lettrevoitureentree-new',
  templateUrl: './lettrevoitureentree-new.component.html',
  styleUrls: ['./lettrevoitureentree-new.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }], 
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LettrevoitureentreeNewComponent implements OnInit {
  public contentHeader: Object;

  public data: LVE;
  public dateReception: NgbDateStruct;

  public uploader: FileUploader = new FileUploader( { isHTML5: true } );

  public currentDate: Date;
  public transporteurs: Transporteur[];

  public ReactiveLveForm: UntypedFormGroup;
  public ReactiveLveFormSubmitted = false;

  public LveForm = {
    numeroRecepisse: '',
    dateReception: '',
    quantiteColis: '',
    quantitePalette: '',
    reclamationQuantitecolis: '',
    reclamationQuantitepalette: '',
    reclamationCommentaire: '',
    transporteur: ''
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _lveNewService: LettrevoitureentreNewService,
    private _transporteurListService: TransporteurListService,
    private _router: Router,
    private calendar: NgbCalendar
  ) { 
    this.dateReception = calendar.getToday();
    this.data = new LVE();
    this.currentDate = new Date();
  }

  get GetReactiveLveForm() {
    return this.ReactiveLveForm.controls;
  }

  ReactiveLveFormOnSubmit() {
    console.log();
    
    this.ReactiveLveFormSubmitted = true;

    if (this.ReactiveLveForm.invalid) {
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
          let form = this.ReactiveLveForm.value;   
          
          let body = {          
            "numeroRecepisse": form.numeroRecepisse,
            "dateReception": this.dateReception ? formatDate(new Date(this.dateReception['year'], this.dateReception['month'] - 1, this.dateReception['day']), 'yyyy-MM-dd', 'en') : '', 
            "quantiteColis": form.quantiteColis,
            "quantitePalette": form.quantitePalette,
            "reclamationQuantitecolis": form.reclamationQuantitecolis,
            "reclamationQuantitepalette": form.reclamationQuantitepalette,
            "reclamationCommentaire": form.reclamationCommentaire,
            "idTransporteur": form.transporteur,
            "fichier": this.uploader.queue[0]?._file.name
          }   
          
          if (this.uploader.queue[0]) {
            this._lveNewService.uploadFile(this.uploader.queue[0]._file).subscribe(
              () => {
                this._lveNewService.addLve(body).subscribe(
                  response => {
                    Swal.fire(
                      {
                        position: 'top-end',
                        icon: 'success',
                        title: 'Ajouté!',
                        html: `Lettre de voiture à été bien enregistrer.`,
                        showConfirmButton: false,
                        timer: 1500
                      }
                    ).then(
                      () => {
                        this._router.navigate([`/lve/detail/${response.id}`])
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
              },
              () => {                
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème avec le fichier!',
                  footer: `<p>Un fichier avec le nom <b>${this.uploader.queue[0]._file.name}</b> existe déjà !</p>`
                })
              }
            );
          } else {
            this._lveNewService.addLve(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Ajouté!',
                    html: `Lettre de voiture à été bien enregistrer.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this._router.navigate([`/lve/detail/${response.id}`])
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
    this.ReactiveLveForm = this.formBuilder.group(
      {
        numeroRecepisse: ['', Validators.required],
        dateReception: ['', Validators.required],
        quantiteColis: [''],
        quantitePalette: [''],
        reclamationQuantitecolis: [''],
        reclamationQuantitepalette: [''],
        reclamationCommentaire: [''],
        transporteur: ['', Validators.required]
      }
    );

    this._transporteurListService.getTransporteur().subscribe(
      res => {
        res['data'].shift()
        this.transporteurs = res['data'];
      }
    );

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
            name: 'Lve',
            isLink: true,
            link: '/lve/list'
          },
          {
            name: 'Ajouter',
            isLink: false
          }
        ]
      }
    };
  }
}
