import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Colis, ColisRequest, UME } from '../ume.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { DetailUmeService } from './detail-ume.service';
import { ZonedepotListService } from 'app/main/zoneDepot/zonedepot-list/zonedepot-list.service';
import { ZoneDepot } from 'app/main/zoneDepot/zonedepot.model';
import { RepartitionListService } from 'app/main/repartition/repartition-list/repartition-list.service';
import { formatDate } from '@angular/common';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DocumentService } from 'app/main/documents/document.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-detail-ume',
  templateUrl: './detail-ume.component.html',
  styleUrls: ['./detail-ume.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailUmeComponent implements OnInit {

  //#region VAR

  public hasRole: String[] = [];
  public contentHeader: Object;

  public currentPageLimit: number = 25;
  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
    { value: 500 },
  ];

  public stock: any[] = [
    { name: 'Asigné', id: 'asigne' },
    { name: 'Asigné et imprimé', id: 'asigneAprinted' },
    { name: 'Confirmé', id: 'confirmer' },
    { name: 'Stock', id: 'stock' }
  ];

  public ume: UME;

  public colis: Colis[];
  public temp: Colis[];

  public destinataires: any[] = [];
  public zones: ZoneDepot[] = [];
  public repInProcess: any[] = [];
  public selectedRep: any[] = [];

  public request: ColisRequest;
  public edit: boolean;
  public isZpl: boolean;
  public actionSelected: string;

  public currentDate: number = new Date().getTime();

  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  public date: string;
  public qteColis: number;
  public qteProduit: number;
  public qte: number;

  public confirmationBtnDisabled: boolean = true;
  public ticktageBtnDisabled: boolean = false;
  public repartitionBtnDisabled: boolean = true;

  public lot: string;
  public updatedDate: Date;
  public now = new Date().toISOString().split('T')[0];
  //#endregion

  constructor (
    private _destinataireListService: DestinataireListService,
    private _umeDetailService: DetailUmeService,
    private _authenticationService: AuthenticationService,
    private _zoneListService: ZonedepotListService,
    private _repListService: RepartitionListService,
    private _documentService: DocumentService,
    private _router: Router,
    private modalService: NgbModal
  ) {
    this.edit = _umeDetailService.editable;

    this.request = new ColisRequest();
    this.request.page.limit = this.currentPageLimit;
    this.request.stock = 'asigne';
    this._unsubscribeAll = new Subject();
  }

  navigation() {
    this._router.navigate([`/ume/edit/${this.ume.id}`]);
  }

  updateOnSubmit() {
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
        confirmButtonText: 'Oui, Modifiez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          let date = isNaN(new Date(this.updatedDate).getTime()) ? 0 : new Date(this.updatedDate).getTime() / 1000;

          this._umeDetailService.updateAll({ lot: this.lot, date: date })
            .subscribe(
              res => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modification!',
                    html: 'Colis à été modifié!',
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this.lot = null;
                    this.updatedDate = null;
                    this.reloadTable();
                  }
                );
              },
              error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  // footer: `<p>${error.error}</p>`
                })
              }
            );
        }
        else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'rien n\'a été modifié',
            'error'
          );
        }
      }
    )
    this.modalService.dismissAll();
  }

  //#region Load DATA

  onSizeChange(size) {
    this.request.page.size = size;
    this.request.page.limit = size;
    this.pageCallback({ offset: 0, pageSize: size, limit: size })
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.request.page.offset = pageInfo.offset;
    this.reloadTable();
  }

  reloadTable() {
    this._umeDetailService.getColisDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.colis = response.data as Colis[];
        this.temp = this.colis;

        this.qteColis = response.size;
        this.qteProduit = this.qteColis * (this.colis[0]?.quantiteProduit ?? 0);

        if (this.colis.length == 0) {
          this.confirmationBtnDisabled = true;
          this.ticktageBtnDisabled = true;
          this.repartitionBtnDisabled = true;
        }
      }
    );
  }

  clear() {
    this.request.idDestinataire = null;
    this.request.stock = null;

    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {
    this.confirmationBtnDisabled = this.request.stock == 'asigneAprinted' ? false : true;
    this.ticktageBtnDisabled = this.request.stock == 'asigne' || this.request.stock == 'asigneAprinted' ? false : true;
    this.repartitionBtnDisabled = this.request.stock == 'stock' ? false : true;

    this.isZpl = this.request.idDestinataire ? true : false;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion 

  //#region forms update and delete

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
              this._umeDetailService.delete().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'UME à été supprimé!',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/ume/list']);
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

  deleteColis(idColis) {
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
          this._umeDetailService.deleteColis(idColis).subscribe(
            res => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Supprimé!',
                  html: 'Colis à été supprimé!',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this.reloadTable();
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
        }
        else if (
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

  addColis(form) {
    if (form.invalid) {
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
        text: "Ajouter nouvelle colis !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, ajoutez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          console.log(this.qte);

          this._umeDetailService.addColis(this.ume.id, this.qte).subscribe(
            () => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: 'Nouvelle colis à été ajouté!',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this.reloadTable();
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
            'rien n\'a été ajouté',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()
  }

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

              let body = {
                id: this.ume.id,
                dateReception: this.date,
                idZoneDepot: form.value.zoneDepot
              }

              console.log(body);

              this._umeDetailService.update(body).subscribe(
                response => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Modifiées!',
                      html: `Les données de L'UME on été bien modifiées.`,
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    res => {
                      this._router.navigate([`/ume/detail/${response.id}`])
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
            else if (result.dismiss === Swal.DismissReason.cancel) {
              swalWithBootstrapButtons.fire(
                'Annulé',
                'rien n\'a pas été modifié',
                'error'
              );
            }
          }
        );
    }
  }

  //#endregion

  //#region Select Repartition MODAL

  private action: string;

  modalConfirm(modal, action: string): void {

    if (this.request.stock) {
      this.actionSelected = action.toUpperCase();
      this.action = action;

      this._repListService.getRepInProcessDataRows()
        .then(
          (response: any) => {
            try {
              this.repInProcess = response.map(
                (e, i) => {
                  return {
                    name: formatDate(e['dateC'], 'dd-MM-yyyy', 'en'),
                    date: new Date(e["dateC"]).setHours(4)
                  }
                }
              );

              if (this.repInProcess) {
                this.modalService.open(modal,
                  {
                    centered: true
                  }
                );
              } else {
                Swal.fire(
                  {
                    icon: 'info',
                    title: 'Oops...',
                    text: 'Aucun réparition trouvé pour cette UME!',
                    showConfirmButton: false,
                    timer: 2000
                  }
                );
              }

            } catch (error) {
              console.error('Error while processing the response:', error);
            }
          }
        )
        .catch(
          (error) => {
            console.error('Error fetching articles:', error);
          }
        );

    }
    else {

      Swal.fire(
        {
          icon: 'error',
          title: 'Oops...',
          text: 'Sélectionné (Asigné ou Asigné et confirmé) pour imprimer une étiquette'
        }
      );

    }
  }

  modalOpenForm(modalForm): void {
    this.modalService.open(modalForm);
  }

  confirm(zplSelected: boolean = false) {

    if (this.action === 'confirmation')
      this.confirmAll();

    else if (this.action === 'ticktage')
      this.printTicktage(zplSelected);

    else
      this.reparti();
  }

  onRepartitionSelect(items) {
    this.selectedRep = items.map(el => el.date / 1000);
  }

  deleteRep(item) {
    this.selectedRep = this.selectedRep.filter(el => { return el.name !== item.name });
  }

  //#endregion

  //#region Actions By Mass

  confirmAll() {
    this._umeDetailService.updateEmplacement(this.selectedRep, this.request.idDestinataire ?? 0).subscribe(
      () => {
        Swal.fire(
          {
            position: 'top-end',
            icon: 'success',
            title: 'Modifier!',
            html: `Emplacement confirmé.`,
            showConfirmButton: false,
            timer: 1500
          }
        ).then(
          () => {
            this.confirmationBtnDisabled = true;
            this.ticktageBtnDisabled = true;
            this.request.stock = "confirmer";
            this.reloadTable();
          }
        );
      }
    );

    this.modalService.dismissAll();
  }

  printTicktage(zplSelected) {

    let stat = this.request.stock === 'asigne' ? 0 : 1;

    console.log(this.ume.id, this.request.idDestinataire, stat, zplSelected);

    this._umeDetailService.printLabel(this.ume.id, zplSelected, stat, this.request.idDestinataire ?? '0', this.selectedRep)
    .subscribe(
      async response => {
        if (response.length > 0) {
          this.generatePDfList(response, zplSelected);

          this.confirmationBtnDisabled = false;
          this.ticktageBtnDisabled = false;

          this.request.stock = "asigneAprinted";
          this.reloadTable();

        } else {
          Swal.fire(
            {
              icon: 'info',
              title: 'Oops...',
              text: 'Aucune étiquette avec la répartition sélectionnée n\'a été trouvée',
            }
          );
        }
      },
      (error) => {
        console.log("Eroor: ", error);

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Impossible d\'imprimer une étiquette sur l\'imprimante'
        });
      }
    );

    this.modalService.dismissAll();
  }

  reparti() {
    this._umeDetailService.repartition(this.selectedRep).subscribe(
      () => {
        Swal.fire(
          {
            position: 'top-end',
            icon: 'success',
            title: 'Réparti!',
            html: `Répartition terminé.`,
            showConfirmButton: false,
            timer: 1500
          }
        ).then(
          () => {
            this.request.stock = 'asigne';

            this.repartitionBtnDisabled = true;
            this.confirmationBtnDisabled = true;
            this.ticktageBtnDisabled = false;

            this.reloadTable();
            this.modalService.dismissAll();
          }
        );
      },
      () => {
        Swal.fire(
          {
            icon: 'error',
            title: 'Erreur !',
            showConfirmButton: true
          }
        ).then(
          () => {
            this.modalService.dismissAll();
          }
        );
      }
    );
  }

  generatePDfList(pdfs: any[], zpl) {
    let pdf: any[] = [];

    pdfs = pdfs.sort(
      (a, b) => parseInt((a['codeUm'] + "").split((a['codeUm'] + "").charAt(0))[1]) - parseInt((b['codeUm'] + "").split((b['codeUm'] + "").charAt(0))[1])
    );

    let enter = 0;

    pdfs.forEach(
      async response => {
        if (response['emplacementConfirme'] == null) {
          enter++;
          const dd = zpl ? this.generateDocumentZPL(response) : this.generateDocument(response);
          pdf.push(dd);
        }
      }
    );

    if (enter > 0) {
      let docDefinition = {
        pageMargins: [5, 5, 5, 0],
        pageSize: {
          width: 385,
          height: 480
        },

        content: pdf
      };

      pdfMake.createPdf(docDefinition).open();
    }
  }

  pdf() {
    let stat = this.request.stock === 'asigne' ? 0 : 1;

    this._umeDetailService.qrCode(this.ume.id, stat, this.request.idDestinataire ?? '0', this.selectedRep)
      .subscribe(
        (blobData: Blob) => {
          this._documentService.openFile(blobData);
          this.confirmationBtnDisabled = false;
          this.ticktageBtnDisabled = false;

          this.request.stock = "asigneAprinted";
          this.reloadTable();
        },
        () => {
          Swal.fire(
            {
              text: "Aucun document n'a été généré !",
              icon: 'warning',
              confirmButtonText: 'OK'
            }
          )
        }
      );
    this.modalService.dismissAll();
  }

  //#endregion

  //#region Actions By Colis 

  private selectedColis: number;

  modalColis(modal: any, id: number) {
    this.modalService.open(modal);
    this.selectedColis = id;
  }

  confirmer(colis: Colis) {

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
        confirmButtonText: 'Oui, ' + (colis.emplacementConfirme ? "déconfirmez-le!" : "confirmez-le!"),
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
      .then(
        (result) => {
          if (result.isConfirmed) {
            let body = {
              id: colis.id
            }

            this._umeDetailService.updateColis(body).subscribe(
              (response) => {
                let html = !response.emplacementConfirme ? "vous avez déconfirmé l'emplacement du colis" : "Vous avez confirmé l'emplacement du colis";

                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Confirmation!',
                    html: html,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this.reloadTable();
                  }
                );
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
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Rien n\'a été modifié',
              'error'
            );
          }
        }
      );
  }

  printLabelByColis(zpl: boolean = false) {
    if (zpl) {
      this._umeDetailService.qrCodeByColis(this.selectedColis)
      .subscribe(
        (blobData: Blob) => {
          this._documentService.openFile(blobData);
          this.reloadTable();
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Impossible d\'imprimer QR sur l\'imprimante'
          });
        }
      )
    } else {
      this._umeDetailService.printLabelByColis(this.selectedColis, zpl)
        .subscribe(
          response => {
            let dd = {
              content: zpl ? this.generateDocumentZPL(response) : this.generateDocument(response),
              pageMargins: [5, 5, 5, 0],
              pageSize: {
                width: 385,
                height: 480
              }
            };
  
            this.reloadTable();
            pdfMake.createPdf(dd).open();
          },
          () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Impossible d\'imprimer une étiquette sur l\'imprimante'
            });
          }
        );
    }

    this.modalService.dismissAll();
  }

  delier(colis: Colis) {
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
        confirmButtonText: 'Oui, Délier-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
      .then(
        (result) => {
          if (result.isConfirmed) {
            this._umeDetailService.delierColis(colis.id).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `Colis a été bien delié.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this.reloadTable();
                  }
                );
              },
              err => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  footer: `<p>${err}</p>`
                });
              }
            );
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Colis n\'a pas été délié',
              'error'
            );
          }
        }
      );
  }

  generateDocumentZPL(response: any) {
    return [
      {
        table: {
          widths: [125, 80, '*'],
          heights: [30, 5, 5, 5, 30],
          body: [
            [
              {
                rowSpan: 5,
                fontSize: 52,
                margin: [0, 35, 0, 0],
                text: response['codeUm']

              },
              {
                colSpan: 2,
                alignment: 'center',
                fontSize: 30,
                bold: true,
                text: response['idColis']
              },
              ''
            ],
            [
              '', {
                text: [
                  'Qté : ',
                  {
                    text: response['qte'],
                    color: '#666',
                    fontSize: 10,
                  },
                ],

              },
              {
                text: [
                  'Numérotation : ',
                  {
                    text: response['numerotation'],
                    color: '#666',
                    fontSize: 10,
                  },
                ],

              }
            ],
            [
              '', {
                text: [
                  'Lot : ',
                  {
                    text: response['lot'],
                    color: '#666',
                    fontSize: 10,
                  },
                ],

              },
              {
                text: [
                  'Article : ',
                  {
                    text: response['codeArticle'],
                    color: '#666',
                    fontSize: 10,
                  },
                ],

              }
            ],
            [
              '', {
                text: [
                  'Date péremption : ',
                  {
                    text: response['date'],
                    color: '#666',
                    fontSize: 10,
                  },
                ],
                colSpan: 2
              },
              ''
            ],
            [
              '', {
                colSpan: 2,
                fontSize: 12,
                bold: true,
                margin: [5, 8, 5, 5],
                text: response['designation']
              }, ''
            ]
          ]
        }
      },
      {
        style: 'tableExample',
        table: {
          heights: 15,
          widths: '*',
          body: [
            [
              {
                text: 'Expéditeur',
                border: [true, false, true, false]
              }
            ],
            [
              {
                text: response['expediteur'],
                fontSize: 10,
                color: '#666',
                border: [true, false, true, true]

              }
            ],
            [
              {
                text: 'Destinataire',
                border: [true, false, true, false]
              }
            ],
            [
              {
                text: response['destinataire'],
                fontSize: 10,
                color: '#666',
                border: [true, false, true, false]

              }
            ]
          ]
        }
      },
      {
        table: {
          heights: 250,
          widths: '*',
          body: [
            [
              {
                image: 'data:image/png;base64,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',
                width: 365,
                height: 250
              }
            ]
          ]
        }
      },
      { text: '', pageBreak: 'before', margin: 0 },
    ];
  }

  generateDocument(response: any) {
    return [
      {
        table: {
          style: 'table',
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: { text: (response['idColis'] ?? '') + '\n', bold: true, fontSize: 52, alignment: 'center' },
                colSpan: 2
              },
              {}
            ],
            [
              {
                text: [{ text: 'Expéditeur \n', bold: true, fontSize: 14 }, { text: (response['expediteur'] ?? '') + '\n\n', fontSize: 11 }],
                margin: [1, 1, 0, 0], colSpan: 2
              },
              {}
            ],
            [
              {
                text: [{ text: 'Destinataire \n', bold: true, fontSize: 14 }, { text: (response['destinataire'] ?? '') + '\n\n', fontSize: 11 }],
                margin: [1, 1, 0, 0], colSpan: 2
              },
              {}
            ],
            [
              {
                text: [{ text: 'Lot \n', bold: true, fontSize: 14 }, { text: (response['lot'] ?? '') + '\n\n', fontSize: 11 }],
                margin: [1, 1, 0, 0], colSpan: 1
              },
              {
                text: [
                  { text: 'Date pérémption \n', bold: true, fontSize: 14 },
                  { text: (response['date'] ?? '') + '\n\n', fontSize: 11 }
                ],
                margin: [1, 1, 0, 0]
              }
            ],
            [
              {
                text: [
                  { text: 'Quantité \n', bold: true, fontSize: 14 },
                  { text: (response['qte'] ?? '') + '\n\n', fontSize: 11 }
                ],
                margin: [1, 1, 0, 0]
              },
              {
                text: [
                  { text: 'Numerotation \n', bold: true, fontSize: 14 },
                  { text: response['numerotation'] + '\n', fontSize: 11 }
                ],
                margin: [1, 1, 0, 0]
              }
            ],
            [
              {
                text: [
                  { text: 'Article \n', bold: true, fontSize: 14 },
                  { text: (response['codeArticle'] ?? '') + '\n\n', fontSize: 11 }
                ],
                margin: [1, 1, 0, 0]
              },
              {
                text: [
                  { text: (response['designation'] ?? '') + '\n', fontSize: 11 }
                ],
                margin: [1, 1, 0, 0]
              }
            ],
            [
              {
                text: [
                  { text: '\n' + response['codeUm'] + '\n', bold: true, fontSize: 52, alignment: 'center' },
                  { text: '------------------------------- \n\n ', fontSize: 6, alignment: 'center' }
                ],
                colSpan: 2
              },
              {}
            ]
          ]
        }
      }
    ];
  }

  //#endregion

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({ name }) => name);

    this._zoneListService.getZONEsDataRows()
      .then(
        (response: any) => {
          try {
            this.zones = response;
          } catch (error) {
            console.error('Error while processing the response:', error);
          }
        }
      )
      .catch(
        (error) => {
          console.error('Error fetching zone:', error);
        }
      );

    this._destinataireListService.getDestinatairesDataRows()
      .then(
        (response: any) => {
          try {
            response['data'].forEach(
              (el) => {
                const name = el.codeUM + ' | ' + el.adresselivraisonNom;
                const id = el.id;
                this.destinataires = [...this.destinataires, { name, id }];
              }
            );
          } catch (error) {
            console.error('Error while processing the response:', error);
          }
        }
      )
      .catch(
        (error) => {
          console.error('Error fetching destinataire:', error);
        }
      );

    this._umeDetailService.getUMEApiData()
      .then(
        (response: any) => {
          try {
            this.ume = response
            console.log(response);

            this.date = formatDate(new Date(this.ume.dateReception), 'yyyy-MM-dd', "en");

            this.contentHeader = {
              headerTitle: 'Liste',
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
                    name: 'Unite manutention entrée',
                    isLink: true,
                    link: '/ume/list'
                  },
                  {
                    name: this.ume.id,
                    isLink: false
                  }
                ]
              }
            };

          } catch (error) {
            console.error('Error while processing the response:', error);
          }
        }
      )
      .catch(
        (error) => {
          console.error('Error fetching ume:', error);
        }
      );

    this.reloadTable();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }

}
