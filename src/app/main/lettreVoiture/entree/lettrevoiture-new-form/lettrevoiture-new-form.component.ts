import { formatDate } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TransporteurListService } from 'app/main/transporteur/transporteur-list/transporteur-list.service';
import Stepper from 'bs-stepper';
import Swal from 'sweetalert2';
import { FileUploader } from 'ng2-file-upload';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { repeaterAnimation } from 'app/main/forms/form-repeater/form-repeater.animation';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { ZonedepotListService } from 'app/main/zoneDepot/zonedepot-list/zonedepot-list.service';
import { Article } from 'app/main/articles/article/article.model';
import { ZoneDepot } from 'app/main/zoneDepot/zonedepot.model';
import { LettrevoitureNewFormService } from './lettrevoiture-new-form.service';

@Component({
  selector: 'app-lettrevoiture-new-form',
  templateUrl: './lettrevoiture-new-form.component.html',
  styleUrls: ['./lettrevoiture-new-form.component.scss'],
  animations: [repeaterAnimation],
  encapsulation: ViewEncapsulation.None
})
export class LettrevoitureNewFormComponent implements OnInit {

  //#region Variables

  public transporteurs: Transporteur[];
  public fournisseurs: Fournisseur[];
  public articles: Article[];
  public zones: ZoneDepot[];

  private formStepper: Stepper;
  private lveFileExist: boolean = false;
  private bleFileExist: boolean = false;

  //#endregion

  constructor(
    private _lveNewFormService: LettrevoitureNewFormService,
    private _transporteurListService: TransporteurListService,
    private _fournisseurListService: FournisseurListService,
    private _articleListService: ArticleListService,
    private _zoneListService: ZonedepotListService,
    private _router: Router,
    private calendar: NgbCalendar
  ) { 
    this.lveDateReception = calendar.getToday();
    this.bleDateReception = calendar.getToday();
  }

  //#region LVE

  public lveDateReception: NgbDateStruct;
  public lveFichier: FileUploader = new FileUploader( { isHTML5: true } );
  public lveFileName = "choisir un fichier";

  public lve: {          
    "numeroRecepisse": string,
    "dateReception": string, 
    "quantiteColis": number,
    "quantitePalette": number,
    "reclamationQuantitecolis": number,
    "reclamationQuantitepalette": number,
    "reclamationCommentaire": string,
    "idTransporteur": number,
    "fichier": string
  };

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

      return;
    }   

    this._lveNewFormService.checkFiles("lve", this.lveFileName).subscribe(
      response => {       
        if (response) {
          this.lveFileExist = true;
        }
      }
    );
  }

  lveFormOnSubmit(lveForm) {

    if (lveForm.invalid) {
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

    if (lveForm.form.valid === true && (this.lveFileName?.toLocaleLowerCase()?.includes("lv") || this.lveFileName === 'choisir un fichier')) {
      this.lve = {          
        "numeroRecepisse": lveForm.form.value.numeroRecepisse,
        "dateReception": formatDate(new Date(lveForm?.form?.value?.date?.year, lveForm?.form?.value?.date?.month - 1, lveForm?.form?.value?.date?.day), 'yyyy-MM-dd', 'en'), 
        "quantiteColis": lveForm.form.value.quantiteColis,
        "quantitePalette": lveForm.form.value.quantitePalette,
        "reclamationQuantitecolis": lveForm.form.value.reclamationQuantitecolis,
        "reclamationQuantitepalette": lveForm.form.value.reclamationQuantitepalette,
        "reclamationCommentaire": lveForm.form.value.reclamationCommentaire,
        "idTransporteur": lveForm.form.value.idTransporteur,
        "fichier": this.lveFileExist ? null : this.lveFichier?.queue[0]?._file.name
      };

      // console.log(this.lve);
      this.formStepper.next();
    } else {
      swalWithBootstrapButtons.fire(
        'Ops',
        'Le fichier importé doit être un fichier LV',
        'error'
      );
    }
  }

  //#endregion

  //#region BLE

  public bleDateReception: NgbDateStruct;
  public bleFichier: FileUploader = new FileUploader( { isHTML5: true } );
  public bleFileName = "choisir un fichier";

  public ble: {          
    "numeroBonLivraison": string,
    "dateReception": string, 
    "quantitePalette": number,
    "commentaire": string,
    "idFournisseur": number,
    "fichier": string,
    "idLve"?: number
  };

  onBleFileSelected() {
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

      return;
    }  

    this._lveNewFormService.checkFiles("ble", this.bleFileName).subscribe(
      response => {
        console.log(response);
        
        if (response) {
          this.bleFileExist = true;
        }
      }
    );
  }

  bleFormOnSubmit(bleForm) {
    if (bleForm.invalid) {
      return;
    }
    
    if (bleForm.form.valid === true && (this.bleFileName?.toLocaleLowerCase()?.includes("bl") || this.bleFileName === 'choisir un fichier')) {
      
      this.ble = {          
        "numeroBonLivraison": bleForm.form.value.numeroBonLivraison,
        "dateReception": formatDate(new Date(bleForm?.form?.value?.date?.year, bleForm?.form?.value?.date?.month - 1, bleForm?.form?.value?.date?.day), 'yyyy-MM-dd', 'en'), 
        "quantitePalette": this.lve.quantitePalette,
        "commentaire": bleForm.form.value.commentaire,
        "idFournisseur": bleForm.form.value.idFournisseur,
        "fichier": this.bleFileExist ? null : this.bleFichier?.queue[0]?._file.name
      };

      // console.log(this.ble);
       
      this._articleListService.getArticleByFournisseur(this.ble.idFournisseur).then(
        response => {
          this.articles = response['data'] as Article[];
        }
      );
      this.formStepper.next();
    } else {
      Swal.fire(
        'Ops',
        'Le fichier importé doit être un fichier BL',
        'error'
      );
    }
  }

  //#endregion

  //#region UME

  public umeDatePeremption: NgbDateStruct[] = [this.calendar.getToday()];
  public item = {
    zone: '',
    article: '',
    qte: '',
    lot: '',
    colisage: '',
    datePeremption: '',
    valid: false
  };

  public items = [this.item];

  articleSelected(event) {
    let colis = this.items.find(el => parseInt(el?.article) === parseInt(event?.id));
    let current = this.items[this.items.length - 1 ];

    if (colis) {
      current.datePeremption = colis.datePeremption;
      current.lot = colis.lot;
      current.zone = colis.zone;
      current.qte = colis.qte;
      current.valid = colis.valid;
    }

    current.colisage = event?.quantiteColisStandard;
  }

  selectedDate(event) {
    const formDate = new Date(event.datePeremption);
    const today = new Date(this.calendar.getToday().year, this.calendar.getToday().month - 1, this.calendar.getToday().day);
    event.valid = formDate > today ? true : false;
  }

  addItem(colisForm) {
    const swalWithBootstrapButtons = Swal.mixin(
      {
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger sup'
        },
        buttonsStyling: false
      }
    );

    if (colisForm.form.valid === true) {  
      const colis = this.items[this.items.length  - 1];

      console.log(colis);
      console.log(this.items);
      
      if (colis.valid) {        
        this.items.push(
          {
            zone: '',
            article: '',
            qte: '',
            lot: '',
            colisage: '',
            datePeremption: '',
            valid: false
          }
        );
      } else {
        swalWithBootstrapButtons.fire(
          'Ops',
          'La date de péremption doit être supérieure à la date d\'aujourd\'hui',
          'error'
        );
      }   
    } else {
      swalWithBootstrapButtons.fire(
        'Ops',
        'Tous les champs doivent être remplis',
        'error'
      );
    }
  }

  deleteItem(id) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items.indexOf(this.items[i]) === id) {
        this.items.splice(i, 1);
        break;
      }
    }
  }

  // onFormsSubmit(umeForm) {
  //   const swalWithBootstrapButtons = Swal.mixin(
  //     {
  //       customClass: {
  //         confirmButton: 'btn btn-success',
  //         cancelButton: 'btn btn-danger sup'
  //       },
  //       buttonsStyling: false
  //     }
  //   );

  //   if (umeForm.form.valid === true && !(this.items.find(el => el.valid === false))) {
  //     swalWithBootstrapButtons.fire(
  //       {
  //         title: 'Vous êtes sûr ?',
  //         text: "Vous ne pourrez pas revenir en arrière !",
  //         icon: 'warning',
  //         showCancelButton: true,
  //         confirmButtonText: 'Oui, ajoutez-le!',
  //         cancelButtonText: 'Non, annulez!',
  //         reverseButtons: true
  //       }
  //     )
  //     .then(
  //       async (result) => {       
  //         if (result.isConfirmed) {    
  //           let lveResponse: LVE; 
  //           let bleResponse: BLE; 

  //           let lveResponseOk = await new Promise<any>(
  //             resolve =>  {
  //               if (this.lveFichier.queue[0]) {
  //                 this._lveNewService.uploadFile(this.lveFichier.queue[0]._file).subscribe(
  //                   () => {
  //                     this._lveNewService.addLve(this.lve).subscribe(
  //                       response => {
  //                         lveResponse = response;
  //                         resolve(true);
  //                       },
  //                       err => {
  //                         Swal.fire({
  //                           icon: 'error',
  //                           title: 'Oops...',
  //                           text: 'Il y a eu un problème!',
  //                           footer: `<p>${err}</p>`
  //                         })
  //                       }
  //                     );
  //                   },
  //                   err => {                
  //                     Swal.fire({
  //                       icon: 'error',
  //                       title: 'Oops...',
  //                       text: 'Il y a eu un problème avec le fichier!',
  //                       footer: `<p>Un fichier avec le nom <b>${this.lveFichier.queue[0]._file.name}</b> existe déjà !</p>`
  //                     })
  //                   }
  //                 );
  //               } else {
  //                 this._lveNewService.addLve(this.lve).subscribe(
  //                   response => {
  //                     lveResponse = response;
  //                     resolve(true);
  //                   },
  //                   err => {
  //                     Swal.fire({
  //                       icon: 'error',
  //                       title: 'Oops...',
  //                       text: 'Il y a eu un problème!',
  //                       footer: `<p>${err}</p>`
  //                     })
  //                   }
  //                 );
  //               }
  //             }    
  //           );

  //           if (lveResponseOk) {
  //             let bleResponseOk = await new Promise<any>(
  //               resolve => {
  //                 this.ble.idLve = lveResponse.id;

  //                 if (this.bleFichier.queue[0]) {
  //                   this._bleNewService.uploadFile(this.bleFichier.queue[0]._file).subscribe(
  //                     () => {
  //                       this._bleNewService.addBle(this.ble).subscribe(
  //                         response => {
  //                           bleResponse = response;
  //                           resolve(true);
  //                         },
  //                         err => {
  //                           Swal.fire({
  //                             icon: 'error',
  //                             title: 'Oops...',
  //                             text: 'Il y a eu un problème!',
  //                             footer: `<p>${err}</p>`
  //                           })
  //                         }
  //                       );
  //                     },
  //                     () => {
  //                       Swal.fire({
  //                         icon: 'error',
  //                         title: 'Oops...',
  //                         text: 'Il y a eu un problème avec le fichier!',
  //                         footer: `<p>Un fichier avec le nom <b>${this.bleFichier.queue[0]._file.name}</b> existe déjà !</p>`
  //                       })
  //                     }
  //                   );
  //                 } else {
  //                   this._bleNewService.addBle(this.ble).subscribe(
  //                     response => {
  //                       bleResponse = response;
  //                       resolve(true);
  //                     },
  //                     err => {
  //                       Swal.fire({
  //                         icon: 'error',
  //                         title: 'Oops...',
  //                         text: 'Il y a eu un problème!',
  //                         footer: `<p>${err}</p>`
  //                       })
  //                     }
  //                   );
  //                 }
  //               }
  //             );

  //             if (bleResponseOk) {

  //               var wait = new Promise(
  //                 resolve => {
  //                   this.items.forEach(
  //                     (el, i) => {
  //                       console.log(el);
                        
  //                       let body = {          
  //                         dateReception: this.ble.dateReception,
  //                         idBle: bleResponse.id,
  //                         idZoneDepot: el.zone,
  //                         numero: i + 1
  //                       };
    
  //                       this._umeNewService.addUme(body).subscribe(
  //                         async response => {
    
  //                           let colis = {
  //                             idArticle : el.article,
  //                             idUme: response.id,
  //                             numeroLot: el.lot,
  //                             quantiteProduit: el.colisage,
  //                             quantiteColisRecue: el.qte,
  //                             quantiteProduitRecue: parseInt(el.colisage) * parseInt(el.qte),
  //                             datePeremption: formatDate(el.datePeremption, 'yyyy-MM-dd', 'en')
  //                           };
    
  //                           this._umeDetailService.addColis(colis).subscribe(() => {},
  //                             err => {
  //                               Swal.fire(
  //                                 {
  //                                   icon: 'error',
  //                                   title: 'Oops...',
  //                                   text: 'Il y a eu un problème!',
  //                                   footer: `<p>${err}</p>`
  //                                 }
  //                               );
  //                             }
  //                           );  
    
  //                           let bleBody = {
  //                             quantiteColis: el.qte,
  //                             quantiteColisRecu: el.qte,
  //                             quantiteProduit: parseInt(el.qte) * parseInt(el.colisage),
  //                             quantiteProduitRecu: parseInt(el.qte) * parseInt(el.colisage),
  //                             idArticle: el.article,
  //                             idBle: bleResponse.id, 
  //                             idUme: response.id
  //                           };
              
  //                           this._bleNewService.addLigneBle(bleBody).subscribe(() => {}); 
  //                         },
  //                         err => {
  //                           Swal.fire({
  //                             icon: 'error',
  //                             title: 'Oops...',
  //                             text: 'Il y a eu un problème!',
  //                             footer: `<p>${err}</p>`
  //                           })
  //                         }
  //                       );

  //                       if (i === this.items.length - 1) {
  //                         resolve(true);
  //                       }
  //                     }
  //                   );
  //                 }
  //               )

  //               wait.then(
  //                 () => {
  //                   Swal.fire(
  //                     {
  //                       position: 'top-end',
  //                       icon: 'success',
  //                       title: 'Ajouté!',
  //                       html: `Les formulaires on été bien enregistrer.`,
  //                       showConfirmButton: false,
  //                       timer: 2000
  //                     }
  //                   ).then(
  //                     async () => {
  //                       this._router.navigate([`ble/detail/${bleResponse.id}`])
  //                     }
  //                   );
  //                 }
  //               );

  //             }
  //           }
  //         } 
  //         else if ( result.dismiss === Swal.DismissReason.cancel ) 
  //         {
  //           swalWithBootstrapButtons.fire(
  //             'Annulé',
  //             'Rien n\'a été ajouté',
  //             'error'
  //           );
  //         }
  //       }
  //     );
  //   } else {
  //     let text = 'La date de péremption doit être supérieure à la date d\'aujourd\'hui';

  //     if (this.items.find(el => el.article === '' || el.colisage === '' || el.lot === '' || el.qte === '' || el.zone === '')) {
  //       text = 'Tous les champs doivent être remplis';
  //     }

  //     swalWithBootstrapButtons.fire(
  //       'Ops',
  //       text,
  //       'error'
  //     );
  //   }

  //   return false;
  // }
  
  //#endregion

  //#region Submits

  async onFormsSubmit(umeForm) {
    try {
      
      if (!umeForm.form.valid || this.items.some(item => !item.valid)) {
        let text = "La date de péremption doit être supérieure à la date d'aujourd'hui";
        
        if (this.items.find(el => (el.article ?? '') === '' || el.lot === '' || el.qte === '' || (el.zone ?? '') === '')) {
            text = 'Tous les champs doivent être remplis';
        }
        
        throw new Error(text);
      }

      const confirmed = await this.showConfirmationDialog();

      if ( confirmed ) {   
        let body = {
          lveRequestDTO: this.lve,
          bleRequestDTO: this.ble,
          umeColisRequestDTO: this.items
        }
    
        this._lveNewFormService.saveForm(body).subscribe(
          async (response) => {
            try {
              const result = await this.upload(response.bleResponseDTO.id);
              console.log('Upload result:', result);
            } catch (error) {
              console.error('Error:', error);
            }
          }
        )
      }
    } catch (error) {
      this.showError(error.message || 'An unexpected error occurred.');
    }
  }
  
  private async upload(id: number) {
    let formData: FormData = new FormData();
    let up = false;

    if (this.lveFichier.queue[0]) {
      up = true;
      formData.append('files', this.lveFichier.queue[0]._file);
    }
  
    if (this.bleFichier.queue[0]) {
      up = true;
      formData.append('files', this.bleFichier.queue[0]._file);
    }
  
    if (up) {
      try {
        const response = await this._lveNewFormService.uploadFile(formData).toPromise();
        console.log('File upload successful');
        this.showSuccess(id);
        
        return response;
      } catch (error) {
        this.showError(error.error.message).then(
          () => {
            this._router.navigate([`ble/detail/${id}`]);
          }
        );
        
        console.error(error);

        throw error; 
      }
    }
  }
  
  //#endregion
  
  //#region Helpers 

  async showConfirmationDialog(): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, ajoutez-le!',
      cancelButtonText: 'Non, annulez!',
      reverseButtons: true
    });
  
    return result.isConfirmed;
  }

  async showError(message): Promise<any> {    
    return Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
    });
  }

  showSuccess(id: number) {    
    Swal.fire(
      {
        position: 'top-end',
        icon: 'success',
        title: 'Ajouté!',
        html: `Les formulaires on été bien enregistrer.`,
        showConfirmButton: false,
        timer: 1500
      }
    ).then(
      () => {
        this._router.navigate([`ble/detail/${id}`])
      }
    );
  }

  vider(type: any) {
    if (type == "lv") {
      this.lveFichier = new FileUploader( { isHTML5: true } );
      this.lveFileName = 'choisir un fichier'; 
    }

    if (type == "bl") {
      this.bleFichier = new FileUploader( { isHTML5: true } );
      this.bleFileName = 'choisir un fichier'; 
    }
  }

  dateValid(form): boolean {
    const formDate = new Date(form?.form?.value?.date?.year, form?.form?.value?.date?.month - 1, form?.form?.value?.date?.day).getTime();
    const today = new Date(this.calendar.getToday().year, this.calendar.getToday().month - 1, this.calendar.getToday().day).getTime();
        
    return today > formDate ? true : false;
  }

  formStepperPrevious() {
    this.formStepper.previous();
  }

  //#endregion

  //#region Hook

  ngOnInit(): void {
    this.formStepper = new Stepper(document.querySelector('#stepper1'), {});

    this._transporteurListService.getTransporteur().subscribe(
      res => {
        this.transporteurs = res['data'];
      }
    );

    this._fournisseurListService.getFournisseursDataRows().then(
      response => {
        this.fournisseurs = response;
      }
    ); 

    this._zoneListService.getZONEsDataRows().then(
      response => {
        this.zones = response as any as ZoneDepot[];
      }
    ); 
  }

  //#endregion

}