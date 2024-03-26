import { formatDate } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TransporteurListService } from 'app/main/transporteur/transporteur-list/transporteur-list.service';
import Stepper from 'bs-stepper';
import Swal from 'sweetalert2';
import { FileUploader } from 'ng2-file-upload';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Transporteur } from 'app/main/transporteur/transporteur.model';
import { repeaterAnimation } from 'app/main/forms/form-repeater/form-repeater.animation';
import { LettrevoitureNewFormService } from './lettrevoiture-new-form.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TransporteurNewService} from "../../transporteur/transporteur-new/transporteur-new.service";

@Component({
  selector: 'app-lettrevoiture-new-form',
  templateUrl: './lettrevoiture-new-form.component.html',
  styleUrls: ['./lettrevoiture-new-form.component.scss'],
  animations: [repeaterAnimation],
  encapsulation: ViewEncapsulation.None
})
export class LettrevoitureNewFormComponent implements OnInit {
    ngOnInit(): void {
    }
}
//
//   //#region Variables
//
//   public transporteurs: Transporteur[];
//
//
//
//   typeDeTarif = [
//     {type: 'Tarif Affretation' },
//     {type: 'Tarif Messagerie' }
//   ];
//
//
//
//   private formStepper: Stepper;
//   private transporteurFileExist: boolean = false;
//
//
//
//   public contentHeader: Object;
//
//   public data: Transporteur;
//
//
//
//   public TrForm = {
//     nom: '',
//     email: '',
//     telephone: '',
//     address: ''
//   };
//
//   //#endregion
//
//   constructor(
//     private _transporteurNewFormService: LettrevoitureNewFormService,
//     private _transporteurListService: TransporteurListService,
//     private _router: Router,
//     private calendar: NgbCalendar,
//
//     private _transporteurNewService: TransporteurNewService
//   ) {
//     this.transporteurFileDateReception = calendar.getToday();
//   this.data = new Transporteur();
//   }
//
//   //#region LVE
//
//   public transporteurFileDateReception: NgbDateStruct;
//   public transporteurFichier: FileUploader = new FileUploader( { isHTML5: true } );
//   public transporteurFileName = "choisir un fichier";
//
//   transpoteur: any = {};
//
//
//   onTransporteurFileSelected() {
//     const length = this.transporteurFichier?.queue?.length;
//
//     this.transporteurFileName = this.transporteurFichier?.queue[length - 1]?._file.name;
//
//     if (!this.transporteurFileName.toLocaleLowerCase().includes("lv")) {
//       Swal.fire(
//         'Ops',
//         'Le fichier importé doit être un fichier dinformations des transporteur',
//         'error'
//       );
//       this.transporteurFichier.queue = [];
//       this.transporteurFileName = 'choisir un fichier';
//
//       return;
//     }
//
//     this._transporteurNewFormService.checkFiles("lve", this.transporteurFileName).subscribe(
//       response => {
//         if (response) {
//           this.transporteurFileExist = true;
//         }
//       }
//     );
//   }
//
//   transporteurFormOnSubmit(lveForm) {
//
//     if (lveForm.invalid) {
//       return;
//     }
//
//     const swalWithBootstrapButtons = Swal.mixin(
//       {
//         customClass: {
//           confirmButton: 'btn btn-success',
//           cancelButton: 'btn btn-danger sup'
//         },
//         buttonsStyling: false
//       }
//     );
//
//     if (lveForm.form.valid === true && (this.transporteurFileName?.toLocaleLowerCase()?.includes("lv") || this.transporteurFileName === 'choisir un fichier')) {
//       this.transpoteur = {
//         "nom": lveForm.form.value.numeroRecepisse,
//         "email": formatDate(new Date(lveForm?.form?.value?.date?.year, lveForm?.form?.value?.date?.month - 1, lveForm?.form?.value?.date?.day), 'yyyy-MM-dd', 'en'),
//         "telephon": lveForm.form.value.quantiteColis,
//         "adresse": lveForm.form.value.quantitePalette,
//         "fichier": this.transporteurFileExist ? null : this.transporteurFichier?.queue[0]?._file.name
//       };
//
//       // console.log(this.lve);
//       this.formStepper.next();
//     } else {
//       swalWithBootstrapButtons.fire(
//         'Ops',
//         'Le fichier importé doit être un fichier d information du transport',
//         'error'
//       );
//     }
//   }
//
//   //#endregion
//
//   //#region BLE
//
//
//
//
//
//
//
//
//
//   //#endregion
//
//   //#region UME
//
//   public umeDatePeremption: NgbDateStruct[] = [this.calendar.getToday()];
//   public item = {
//     zone: '',
//     article: '',
//     qte: '',
//     lot: '',
//     colisage: '',
//     datePeremption: '',
//     valid: false
//   };
//
//   public items = [this.item];
//
//   articleSelected(event) {
//     let colis = this.items.find(el => parseInt(el?.article) === parseInt(event?.id));
//     let current = this.items[this.items.length - 1 ];
//
//     if (colis) {
//       current.datePeremption = colis.datePeremption;
//       current.lot = colis.lot;
//       current.zone = colis.zone;
//       current.qte = colis.qte;
//       current.valid = colis.valid;
//     }
//
//     current.colisage = event?.quantiteColisStandard;
//   }
//
//   selectedDate(event) {
//     const formDate = new Date(event.datePeremption);
//     const today = new Date(this.calendar.getToday().year, this.calendar.getToday().month - 1, this.calendar.getToday().day);
//     event.valid = formDate > today ? true : false;
//   }
//
//   addItem(colisForm) {
//     const swalWithBootstrapButtons = Swal.mixin(
//       {
//         customClass: {
//           confirmButton: 'btn btn-success',
//           cancelButton: 'btn btn-danger sup'
//         },
//         buttonsStyling: false
//       }
//     );
//
//     if (colisForm.form.valid === true) {
//       const colis = this.items[this.items.length  - 1];
//
//       console.log(colis);
//       console.log(this.items);
//
//       if (colis.valid) {
//         this.items.push(
//           {
//             zone: '',
//             article: '',
//             qte: '',
//             lot: '',
//             colisage: '',
//             datePeremption: '',
//             valid: false
//           }
//         );
//       } else {
//         swalWithBootstrapButtons.fire(
//           'Ops',
//           'La date de péremption doit être supérieure à la date d\'aujourd\'hui',
//           'error'
//         );
//       }
//     } else {
//       swalWithBootstrapButtons.fire(
//         'Ops',
//         'Tous les champs doivent être remplis',
//         'error'
//       );
//     }
//   }
//
//   deleteItem(id) {
//     for (let i = 0; i < this.items.length; i++) {
//       if (this.items.indexOf(this.items[i]) === id) {
//         this.items.splice(i, 1);
//         break;
//       }
//     }
//   }
//
//
//
//   async onFormsSubmit(umeForm) {
//     try {
//
//       if (!umeForm.form.valid || this.items.some(item => !item.valid)) {
//         let text = "La date de péremption doit être supérieure à la date d'aujourd'hui";
//
//         if (this.items.find(el => (el.article ?? '') === '' || el.lot === '' || el.qte === '' || (el.zone ?? '') === '')) {
//             text = 'Tous les champs doivent être remplis';
//         }
//
//         throw new Error(text);
//       }
//
//       const confirmed = await this.showConfirmationDialog();
//
//       if ( confirmed ) {
//         let body = {
//           transporteurRequestDto: this.transpoteur,
//           umeColisRequestDTO: this.items
//         }
//
//         this._lveNewFormService.saveForm(body).subscribe(
//           async (response) => {
//             try {
//               const result = await this.upload(response.bleResponseDTO.id);
//               console.log('Upload result:', result);
//             } catch (error) {
//               console.error('Error:', error);
//             }
//           }
//         )
//       }
//     } catch (error) {
//       this.showError(error.message || 'An unexpected error occurred.');
//     }
//   }
//
//   private async upload(id: number) {
//     let formData: FormData = new FormData();
//     let up = false;
//
//     if (this.lveFichier.queue[0]) {
//       up = true;
//       formData.append('files', this.lveFichier.queue[0]._file);
//     }
//
//     if (this.bleFichier.queue[0]) {
//       up = true;
//       formData.append('files', this.bleFichier.queue[0]._file);
//     }
//
//     if (up) {
//       try {
//         const response = await this._lveNewFormService.uploadFile(formData).toPromise();
//         console.log('File upload successful');
//         this.showSuccess(id);
//
//         return response;
//       } catch (error) {
//         this.showError(error.error.message).then(
//           () => {
//             this._router.navigate([`ble/detail/${id}`]);
//           }
//         );
//
//         console.error(error);
//
//         throw error;
//       }
//     }
//   }
//
//   //#endregion
//
//   //#region Helpers
//
//   async showConfirmationDialog(): Promise<boolean> {
//     const result = await Swal.fire({
//       title: 'Vous êtes sûr ?',
//       text: "Vous ne pourrez pas revenir en arrière !",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Oui, ajoutez-le!',
//       cancelButtonText: 'Non, annulez!',
//       reverseButtons: true
//     });
//
//     return result.isConfirmed;
//   }
//
//   async showError(message): Promise<any> {
//     return Swal.fire({
//       icon: 'error',
//       title: 'Oops...',
//       text: message,
//     });
//   }
//
//   showSuccess(id: number) {
//     Swal.fire(
//       {
//         position: 'top-end',
//         icon: 'success',
//         title: 'Ajouté!',
//         html: `Les formulaires on été bien enregistrer.`,
//         showConfirmButton: false,
//         timer: 1500
//       }
//     ).then(
//       () => {
//         this._router.navigate([`ble/detail/${id}`])
//       }
//     );
//   }
//
//   vider(type: any) {
//     if (type == "lv") {
//       this.lveFichier = new FileUploader( { isHTML5: true } );
//       this.lveFileName = 'choisir un fichier';
//     }
//
//     if (type == "bl") {
//       this.bleFichier = new FileUploader( { isHTML5: true } );
//       this.bleFileName = 'choisir un fichier';
//     }
//   }
//
//   dateValid(form): boolean {
//     const formDate = new Date(form?.form?.value?.date?.year, form?.form?.value?.date?.month - 1, form?.form?.value?.date?.day).getTime();
//     const today = new Date(this.calendar.getToday().year, this.calendar.getToday().month - 1, this.calendar.getToday().day).getTime();
//
//     return today > formDate ? true : false;
//   }
//
//   formStepperPrevious() {
//     this.formStepper.previous();
//   }
//
//   //#endregion
//
//   //#region Hook
//
//   ngOnInit(): void {
//     this.formStepper = new Stepper(document.querySelector('#stepper1'), {});
//
//     this._transporteurListService.getTransporteur().subscribe(
//       res => {
//         this.transporteurs = res['data'];
//       }
//     );
//
//
//
//
//   }
//
//
//
//
//
//   get ReactiveTrForm() {
//     return this.ReactiveTransporteurForm.controls;
//   }
//
//   ReactiveTrFormOnSubmit() {
//     this.ReactiveTrFormSubmitted = true;
//
//     if (this.ReactiveTransporteurForm.invalid) {
//       return;
//     }
//
//     const swalWithBootstrapButtons = Swal.mixin(
//         {
//           customClass: {
//             confirmButton: 'btn btn-success',
//             cancelButton: 'btn btn-danger sup'
//           },
//           buttonsStyling: false
//         }
//     );
//
//     swalWithBootstrapButtons.fire(
//         {
//           title: 'Vous êtes sûr ?',
//           text: "Vous ne pourrez pas revenir en arrière !",
//           icon: 'warning',
//           showCancelButton: true,
//           confirmButtonText: 'Oui, ajoutez-le!',
//           cancelButtonText: 'Non, annulez!',
//           reverseButtons: true
//         }
//     )
//         .then(
//             (result) => {
//               if (result.isConfirmed) {
//                 let form = this.ReactiveTransporteurForm.value;
//
//                 let body: Transporteur = {
//                   nom: form.nom,
//                   email: form.email,
//                   address: form.address,
//                   telephone: form.telephone,
//                 }
//
//                 this._transporteurNewService.addTransporteur(body).subscribe(
//                     response => {
//                       Swal.fire(
//                           {
//                             position: 'top-end',
//                             icon: 'success',
//                             title: 'Ajouté!',
//                             html: `le transporteur ${response.nom} à été bien ajouté.`,
//                             showConfirmButton: false,
//                             timer: 1500
//                           }
//                       ).then(
//                           () => {
//                             this._router.navigate(['/transporteurs/list'])
//                           }
//                       );
//                     },
//                     err => {
//                       Swal.fire({
//                         icon: 'error',
//                         title: 'Oops...',
//                         text: 'Il y a eu un problème!',
//                         footer: `<p>${err}</p>`
//                       })
//                     }
//                 );
//
//               }
//               else if ( result.dismiss === Swal.DismissReason.cancel )
//               {
//                 swalWithBootstrapButtons.fire(
//                     'Annulé',
//                     'le transporteur n\'a pas été ajouté',
//                     'error'
//                 );
//               }
//             }
//         );
//   }
//
//
//
//   //#endregion
//
//   //protected readonly Destinataire = Destinataire;
// }