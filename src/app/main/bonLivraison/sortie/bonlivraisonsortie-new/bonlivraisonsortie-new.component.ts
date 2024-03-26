import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BCS } from 'app/main/bonCommand/sortie/bcs.model';
import { BoncommandsortieDetailService } from 'app/main/bonCommand/sortie/boncommandsortie-detail/boncommandsortie-detail.service';
import { TransporteurListService } from 'app/main/transporteur/transporteur-list/transporteur-list.service';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { BLS } from '../bls.model';
import { BonlivraisonsortieNewService } from './bonlivraisonsortie-new.service';
import { NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';

import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';

@Component({
  selector: 'app-bonlivraisonsortie-new',
  templateUrl: './bonlivraisonsortie-new.component.html',
  styleUrls: ['./bonlivraisonsortie-new.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }] 
})
export class BonlivraisonsortieNewComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  
  public dateImpression: NgbDateStruct;
  
  public contentHeader: Object;
  
  public bcs: BCS;
  public bls: BLS;
  public transporteurs: Transporteur[];

  public ReactiveBlsForm: UntypedFormGroup;
  public ReactiveBlsFormSubmitted = false;

  public BlsForm = {
    dateImpression: '',
    numeroBonLivraison: '',
    prixExpedition: '',
    codeTracking: '',
    idBcs: '',
    transporteur: '',
    codeUM: ''
  };

  constructor(
    private _blsNewService: BonlivraisonsortieNewService,
    private _transporteurListService: TransporteurListService,
    private _bcsDetailService: BoncommandsortieDetailService,
    private formBuilder: UntypedFormBuilder,
    private _router: Router
  ) {
    this.bcs = new BCS();
    this._unsubscribeAll = new Subject();
  }


  get GetReactiveBlsForm() {
    return this.ReactiveBlsForm.controls;
  }

  ReactiveBlsFormOnSubmit() {
    this.ReactiveBlsFormSubmitted = true;

    if (this.ReactiveBlsForm.invalid) {
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
          let form = this.ReactiveBlsForm.value;   
          
          let month = parseInt(form.dateImpression.month) < 10 ? `0${form.dateImpression.month}` : form.dateImpression.month;
          let day = parseInt(form.dateImpression.day) < 10 ? `0${form.dateImpression.day}` : form.dateImpression.day;

          let body = {          
            dateImpression: form.dateImpression.year + '-' + month + '-' + day,
            numeroBonLivraison: form.numeroBonLivraison,
            prixExpedition: form.prixExpedition,
            codeTracking: form.codeTracking,
            idBcs: form.idBcs,
            idTransporteur: form.transporteur
          };   
          
          console.log(body);

          // this._blsNewService.addBls(body).subscribe(
          //   response => {
          //     console.log(response);
              
          //     Swal.fire(
          //       {
          //         position: 'top-end',
          //         icon: 'success',
          //         title: 'Ajouté!',
          //         html: `Bls à été bien enregistrer.`,
          //         showConfirmButton: false,
          //         timer: 1500
          //       }
          //     ).then(
          //       res => {
          //         this._router.navigate([`/bls/detail/${response.id}`]);
          //       }
          //     );
          //   },
          //   err => {
          //     Swal.fire({
          //       icon: 'error',
          //       title: 'Oops...',
          //       text: 'Il y a eu un problème!',
          //       footer: `<p>${err}</p>`
          //     })
          //   }
          // );

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
    this._transporteurListService.getTransporteur().subscribe(
      res => {
        res['data'].shift()
        this.transporteurs = res['data'];
      }
    );

    this._bcsDetailService.onBCSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.bcs = response;        
      }
    ); 

    let date = new Date();
    let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    let year = date.getFullYear().toString().substring(2);

    this.ReactiveBlsForm = this.formBuilder.group(
      {
        dateImpression: [],
        numeroBonLivraison: [`BL-${this.bcs.numeroCommande}`],
        prixExpedition: [''],
        codeTracking: [`TrBL${this.bcs.numeroCommande}-${this.bcs.destinataire.codeUM}-Ts${day}${month}${year}`],
        idBcs: [this.bcs.id],
        transporteur: ['', Validators.required],
        codeUM: [this.bcs.destinataire.codeUM]
      }  
    );  

    this.contentHeader = {
      headerTitle: 'Bon de livraison sortie',
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
            name: 'Bls',
            isLink: true,
            link: '/bls/list'
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
