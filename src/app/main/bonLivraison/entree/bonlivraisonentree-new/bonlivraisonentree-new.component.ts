import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { formatDate } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { BonlivraisonentreeNewService } from './bonlivraisonentree-new.service';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { BLE } from '../ble.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LettrevoitureentreDetailService } from 'app/main/lettreVoiture/entree/lettrevoitureentree-detail/lettrevoitureentre-detail.service';
import { LVE } from 'app/main/lettreVoiture/entree/lve.model';
import { FileUploader } from 'ng2-file-upload';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';

@Component({
  selector: 'app-bonlivraisonentree-new',
  templateUrl: './bonlivraisonentree-new.component.html',
  styleUrls: ['./bonlivraisonentree-new.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BonlivraisonentreeNewComponent implements OnInit {

  public contentHeader: Object;
  public uploader: FileUploader = new FileUploader( { isHTML5: true } );

  public ble: BLE;
  public lve: LVE;

  public currentDate: Date;
  public fournisseurs: Fournisseur[];

  public ReactiveBleForm: UntypedFormGroup;
  public ReactiveBleFormSubmitted = false;

  public dateReception: NgbDateStruct;

  public BleForm = {
    dateReception:'',
    numeroBonLivraison:'',
    commentaire:'',
    fournisseur:''
  };

  private _unsubscribeAll: Subject<any>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _lveDetailService: LettrevoitureentreDetailService,
    private _bleListService: BonlivraisonentreeNewService,
    private _fournisseurListService: FournisseurListService,
    private _router: Router,
    private calendar: NgbCalendar
  ) { 
    this.ble = new BLE();
    this.lve = new LVE();
    this.dateReception = calendar.getToday();

    this.currentDate = new Date();
    this._unsubscribeAll = new Subject();
  }

  get GetReactiveBleForm() {
    return this.ReactiveBleForm.controls;
  }

  ReactiveBleFormOnSubmit() {
    this.ReactiveBleFormSubmitted = true;

    if (this.ReactiveBleForm.invalid) {
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
          let form = this.ReactiveBleForm.value;   
          
          let body = {          
            dateReception: this.dateReception ? formatDate(new Date(this.dateReception['year'], this.dateReception['month'] - 1, this.dateReception['day']), 'yyyy-MM-dd', 'en') : '', 
            numeroBonLivraison: form.numeroBonLivraison,
            quantitePalette: this.lve.quantitePalette,
            commentaire: form.commentaire,
            idFournisseur: form.fournisseur,
            idLve: this.lve.id,
            "fichier": this.uploader.queue[0]?._file.name
          }   

          if (this.uploader.queue[0]) {
            this._bleListService.uploadFile(this.uploader.queue[0]._file).subscribe(
              () => {
                this._bleListService.addBle(body).subscribe(
                  response => {
                    Swal.fire(
                      {
                        position: 'top-end',
                        icon: 'success',
                        title: 'Ajouté!',
                        html: `Bon de livraison à été bien enregistrer.`,
                        showConfirmButton: false,
                        timer: 1500
                      }
                    ).then(
                      () => {
                        this._router.navigate([`/ble/detail/${response.id}`]);
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
            this._bleListService.addBle(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Ajouté!',
                    html: `Bon de livraison à été bien enregistrer.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this._router.navigate([`/ble/detail/${response.id}`]);
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
    this.ReactiveBleForm = this.formBuilder.group(
      {
        dateReception: ['', Validators.required],
        numeroBonLivraison: ['', Validators.required],
        commentaire: [''],
        fournisseur: ['', Validators.required],
      }
    );

    this._lveDetailService.onLVEDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.lve = response;       
      }
    ); 

    this._fournisseurListService.onFournisseurListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.fournisseurs = response;             
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
            name: 'Ble',
            isLink: true,
            link: '/ble/list'
          },
          {
            name: 'Ajouter',
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
