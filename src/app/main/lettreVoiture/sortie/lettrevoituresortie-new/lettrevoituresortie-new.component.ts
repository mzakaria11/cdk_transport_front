import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {Transporteur} from "../../../transporteur/transporteur.model";
import {Fournisseur} from "../../../fournisseurs/fournisseur/fournisseur.model";
import {Article} from "../../../articles/article/article.model";
import {ZoneDepot} from "../../../zoneDepot/zonedepot.model";
import Stepper from "bs-stepper";
import {LettrevoitureNewFormService} from "../../entree/lettrevoiture-new-form/lettrevoiture-new-form.service";
import {TransporteurListService} from "../../../transporteur/transporteur-list/transporteur-list.service";
import {FournisseurListService} from "../../../fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service";
import {ArticleListService} from "../../../articles/article/article-list/article-list.service";
import {ZonedepotListService} from "../../../zoneDepot/zonedepot-list/zonedepot-list.service";
import {Router} from "@angular/router";
import {NgbCalendar, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {FileUploader} from "ng2-file-upload";
import Swal from "sweetalert2";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-lettrevoituresortie-new',
  templateUrl: './lettrevoituresortie-new.component.html',
  styleUrls: ['./lettrevoituresortie-new.component.scss']
})
export class LettrevoituresortieNewComponent implements OnInit {

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
