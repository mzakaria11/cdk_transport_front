import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { formatDate } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import Swal from 'sweetalert2';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BonlivraisonentreeDetailService } from 'app/main/bonLivraison/entree/bonlivraisonentree-detail/bonlivraisonentree-detail.service';
import { BLE } from 'app/main/bonLivraison/entree/ble.model';
import { UnitemanutentionentreeNewService } from './unitemanutentionentree-new.service';
import { ZonedepotListService } from 'app/main/zoneDepot/zonedepot-list/zonedepot-list.service';
import { ZoneDepot } from 'app/main/zoneDepot/zonedepot.model';
import { NgbDateStruct, NgbDatepickerI18n, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { Article } from 'app/main/articles/article/article.model';
import { UnitemanutentionentreeDetailService } from '../unitemanutentionentree-detail/unitemanutentionentree-detail.service';
import { BonlivraisonentreeNewService } from 'app/main/bonLivraison/entree/bonlivraisonentree-new/bonlivraisonentree-new.service';

@Component({
  selector: 'app-unitemanutentionentree-new',
  templateUrl: './unitemanutentionentree-new.component.html',
  styleUrls: ['./unitemanutentionentree-new.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class UnitemanutentionentreeNewComponent implements OnInit {

  public contentHeader: Object;

  public zone: ZoneDepot[];
  public ble: BLE;

  public dateReceptionOptions: FlatpickrOptions = {
    altInput: true,
  };

  public fournisseurs: Fournisseur[];
  public articles: Article[];

  public ReactiveUmeForm: UntypedFormGroup;
  public ReactiveUmeFormSubmitted = false;

  public UmeForm = {
    dateReception:'',
    bl: '',
    numero: '',
    zoneDepot: '',
    article: '',
    qteColis: '',
    colisage: '',
    lot: '',
    datePeremption: '',
  };

  public selected: any;
  public articleSelected: any;
  public colisage: any;
  public dateReception: NgbDateStruct;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _bleDetailService: BonlivraisonentreeDetailService,
    private _umeNewService: UnitemanutentionentreeNewService,
    private _zoneListService: ZonedepotListService,
    private _articleListService: ArticleListService,
    private _bleNewService: BonlivraisonentreeNewService,
    private _umeDetailService: UnitemanutentionentreeDetailService,
    private formBuilder: UntypedFormBuilder,
    private _router: Router
  ) { 
    this.ble = new BLE();    
    this._unsubscribeAll = new Subject();
  }

  get GetReactiveUmeForm() {
    return this.ReactiveUmeForm.controls;
  }

  ReactiveUmeFormOnSubmit() {
    
    this.ReactiveUmeFormSubmitted = true;
   
    if (this.ReactiveUmeForm.invalid || this.dateValid(this.ReactiveUmeForm)) {
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
          let form = this.ReactiveUmeForm.value;   
          
          let day = this.dateReception['day'] > 9 ? this.dateReception['day'] : '0' + this.dateReception['day'];
          let month = this.dateReception['month'] > 9 ? this.dateReception['month'] : '0' + this.dateReception['month'];

          let body = {          
            dateReception: this.dateReception['year'] + '-' + month + '-' + day,
            idBle: this.ble.id,
            idZoneDepot: form.zoneDepot
          };                

          this._umeNewService.addUme(body).subscribe(
            async response => {

              let colis = {
                idArticle : form.article,
                idUme: response.id,
                numeroLot: form.lot,
                quantiteProduit: form.colisage,
                quantiteColisRecue: form.qteColis,
                quantiteProduitRecue: parseInt(form.colisage) * parseInt(form.qteColis),
                datePeremption: formatDate(form.datePeremption, 'yyyy-MM-dd', 'en')
              };

              let colisResponseOk = await new Promise<any>(
                resolve => {
                  this._umeDetailService.addColis(colis).subscribe(
                    response => {
                      resolve(true);
                    },
                    err => {
                      Swal.fire(
                        {
                          icon: 'error',
                          title: 'Oops...',
                          text: 'Il y a eu un problème!',
                          footer: `<p>${err}</p>`
                        }
                      );
                    }
                  );  

                  let bleBody = {
                    quantiteColis: form.qteColis,
                    quantiteColisRecu: form.qteColis,
                    quantiteProduit: parseInt(form.qteColis) * parseInt(form.colisage),
                    quantiteProduitRecu: parseInt(form.qteColis) * parseInt(form.colisage),
                    idArticle: form.article,
                    idBle: this.ble.id,
                    idUme: response.id
                  };
    
                  this._bleNewService.addLigneBle(bleBody).subscribe(() => {
                    Swal.fire(
                      {
                        position: 'top-end',
                        icon: 'success',
                        title: 'Ajouté!',
                        html: `Ume à été bien enregistrer.`,
                        showConfirmButton: false,
                        timer: 1500
                      }
                    ).then(
                      res => {
                        this._router.navigate([`ume/detail/${response.id}`])
                      }
                    )
                  }); 
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
            'Rien n\'a été ajouté',
            'error'
          );
        }
      }
    );
  }

  onArticleChange(event) {
    this.colisage = event.quantiteColisStandard;
  }

  customSearchFn(term: string, item: any) {
    term = term.toLowerCase();     

    let splitTerm = term.split(' ').filter(t => t);

    let isWordThere = [];
    
    splitTerm.forEach(
      arr_term => {      
        let search = item['designationClient'].toLowerCase();
        isWordThere.push(search.indexOf(arr_term) != -1);
      }
    );

    const all_words = (this_word) => this_word;

    return isWordThere.every(all_words);  
  }

  dateValid(form): boolean {
    // console.log(form);
    
    const formDate = new Date(form?.value?.datePeremption).getTime();
    const today = new Date().getTime();
            
    return today > formDate ? true : false;
  }

  ngOnInit(): void {
    this.ReactiveUmeForm = this.formBuilder.group(
      {
        dateReception: [''],
        bl: [''],
        numero: [''],
        zoneDepot: ['', Validators.required],
        article: ['', Validators.required],
        qteColis: ['', Validators.required],
        colisage: ['', Validators.required],
        lot: ['', Validators.required],
        datePeremption: ['', Validators.required],
      }
    );

    this._bleDetailService.onBLEDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.ble = response;    
        let d = new Date(this.ble.dateReception);
        this.dateReception = new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate())   
      }
    ); 

    this._zoneListService.getZONEsDataRows().then(
      res => {        
        this.zone = res as any;
      }
    );

    this._articleListService.getAllArticlesDataRows().then(
      res => {        
        this.articles = res as any;
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
            name: 'Ume',
            isLink: true,
            link: '/ume/list'
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
