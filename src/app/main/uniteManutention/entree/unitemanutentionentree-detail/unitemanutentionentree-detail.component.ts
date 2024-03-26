import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDate, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import { Article } from 'app/main/articles/article/article.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UME, Colis } from '../ume.model';
import { UnitemanutentionentreeDetailService } from './unitemanutentionentree-detail.service';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { formatDate } from '@angular/common';
import { ScriptDashboardService } from 'app/main/script/script-dashboard/script-dashboard.service';
import { ZoneDepot } from 'app/main/zoneDepot/zonedepot.model';
import { ZonedepotListService } from 'app/main/zoneDepot/zonedepot-list/zonedepot-list.service';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 

@Component({
  selector: 'app-unitemanutentionentree-detail',
  templateUrl: './unitemanutentionentree-detail.component.html',
  styleUrls: ['./unitemanutentionentree-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }] 
})
export class UnitemanutentionentreeDetailComponent implements OnInit {

  public hasRole: String[] = [];

  public url = this.router.url;
  public ume: UME;
  public date: NgbDateStruct;

  public contentHeader: Object;
  public edit: boolean;
  public currentDate: number = new Date().getTime();

  public repartition;

  public rows;
  public selectedOption = 25;
  public idArticle: number;

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  
  public printed: boolean = false;
  
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('umeForm') umeForm: NgForm;

  public tempData: Article[] = [];
  public colisTempData: any[] = [];

  public totalQte: number = 0;
  public zone: ZoneDepot[];

  public ble: number;
  
  private tempColis: any[] = [];
  private _unsubscribeAll: Subject<any>;
  private selectedRepartitions: any[] = [];

  constructor(
    private router: Router, 
    private _umeDetailService: UnitemanutentionentreeDetailService,
    private _authenticationService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _scriptService: ScriptDashboardService,
    private _zoneListService: ZonedepotListService
  ) { 
    this.edit = _umeDetailService.editable;
    // this.ble = _umeDetailService.;
    this._unsubscribeAll = new Subject();    
  }

  repartir() {
    let body = this.selectedRepartitions.map(({date}) => date / 1000);

    let idArticle = this.ume?.colis[0]?.article.id;

    this._umeDetailService.repartir(idArticle, body).subscribe(
      async response => {
        this._umeDetailService.getApiData(this.ume.id);
        Swal.fire(
          {
            position: 'top-end',
            icon: 'success',
            title: 'Répartition!',
            html: 'La répartition a été effectué avec succés.',
            showConfirmButton: false,
            timer: 1500
          }
        )
      },
      ({error}) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Quelque chose n\'a pas fonctionné avec le script de répartition'
        });
      }
    );

    this.modalService.dismissAll();
  }

  print() {
    let body = this.selectedRepartitions.map(({date}) => date / 1000);
    
    let stat = this.selectedStatut.value == 0 ? "asigned" : "confrimed";
    
    this._umeDetailService.printEtiquette(this.ume.id, this.idArticle, stat, body).subscribe(
      async response => {
        if (response.length > 0) {
          this.generatePDfList(response);
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
      ({error}) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Impossible d\'imprimer une étiquette sur l\'imprimante'
        });
      }
    );

    this.modalService.dismissAll();
  }

  generatePDfList(pdfs: any[]) {
    let pdf: any[] = [];

    pdfs = pdfs.sort(
      (a, b) =>  parseInt((a['codeUm'] + "").split((a['codeUm'] + "").charAt(0))[1]) - parseInt((b['codeUm'] + "").split((b['codeUm'] + "").charAt(0))[1])
    );
    
    const count = pdfs.reduce((a, v) => {a[v.codeUm] = ++a[(v.codeUm)] || 1; return a}, {});
    
    let codeUM = pdfs[0]['codeUm'];
    let cpt = 0;
    let enter = 0;

    console.log(pdfs);
    
    pdfs.forEach(
      async response => {       
        if (response['emplacementConfirme'] == null) {
          enter++;
          cpt = response['codeUm'] == codeUM ? (cpt + 1) : 1;
          codeUM = codeUM == response['codeUm'] ? codeUM : response['codeUm'];
  
          const dd = [
            {
              table: {
                style: 'table',
                widths: ['50%', '50%'],
                body: [
                  [
                      {
                          text: {text: response['idColis'] + '\n', bold: true, fontSize: 52, alignment: 'center'}, 
                          colSpan: 2
                      },
                      {}
                  ],
                  [
                      {
                          text: [{text: 'Expéditeur \n', bold: true, fontSize: 14}, {text: response['expediteur'] + '\n\n', fontSize: 11}],
                          margin: [1,1, 0, 0], colSpan: 2
                      },
                      {}
                  ],
                  [
                      {
                          text: [{text: 'Destinataire \n', bold: true, fontSize: 14}, {text: response['destinataire'] + '\n\n', fontSize: 11}],
                          margin: [1,1, 0, 0], colSpan: 2
                      },
                      {}
                  ],
                  [
                      {
                          text: [{text: 'Lot \n', bold: true, fontSize: 14}, {text: response['lot'] + '\n\n', fontSize: 11}],
                          margin: [1,1, 0, 0], colSpan: 1
                      },
                      {
                          text: [
                              {text: 'Date pérémption \n', bold: true, fontSize: 14}, 
                              {text: response['date'] + '\n\n', fontSize: 11}
                          ],
                          margin: [1,1, 0, 0]
                      }
                  ],
                  [
                      {
                          text: [
                              {text: 'Quantité \n', bold: true, fontSize: 14}, 
                              {text: response['qte'] + '\n\n', fontSize: 11}
                          ],
                          margin: [1,1, 0, 0]
                      },
                      {
                          text: [
                              {text: 'Numerotation \n', bold: true, fontSize: 14}, 
                              {text: cpt + '/' + count[codeUM] + '\n', fontSize: 11}
                          ],
                          margin: [1,1, 0, 0]
                      }
                  ],
                  [
                      {
                          text: [
                              {text: 'Article \n', bold: true, fontSize: 14}, 
                              {text: response['codeArticle'] + '\n\n', fontSize: 11}
                          ],
                          margin: [1,1, 0, 0]
                      },
                      {
                          text: [
                              {text: response['designation'] + '\n', fontSize: 11}
                          ],
                          margin: [1,1, 0, 0]
                      }
                  ],
                  [
                      {
                          text: [
                              {text: '\n' + response['codeUm'] + '\n', bold: true, fontSize: 52, alignment: 'center'},
                              {text: '------------------------------- \n\n ', fontSize: 6, alignment: 'center'}
                          ], 
                          colSpan: 2
                      },
                      {}
                  ]
                ]
              }
            }
          ]; 
          
          pdf.push(dd);
          
          if (response.printed == 0) {
            this.setPrinted(response['idColis']);
            new Promise(f => setTimeout(f, 150));
          }
          
        }
      }
    );

    if (enter > 0) {      
      let docDefinition = {
        pageMargins : [5, 5, 5, 0],   
        pageSize: {
            width: 385,
            height: 480
        },
  
        content : pdf
      };   
      
      pdfMake.createPdf(docDefinition).open();  
    }    
  }

  printByColis(id: number) {
    this._umeDetailService.printByColis(id).subscribe(
      response => {
        let dd = {
          content: [
            {
                  table: {
                    style: 'table',
                    widths: ['50%', '50%'], // Add another 33.33% for the third header cell
                    body: [
                        [
                            {
                                text: {text: response['idColis'] + '\n', bold: true, fontSize: 52, alignment: 'center'}, 
                                colSpan: 2
                            },
                            {}
                        ],
                        [
                            {
                                text: [{text: 'Expéditeur \n', bold: true, fontSize: 14}, {text: response['expediteur'] + '\n\n', fontSize: 11}],
                                margin: [1,1, 0, 0], colSpan: 2
                            },
                            {}
                        ],
                        [
                            {
                                text: [{text: 'Destinataire \n', bold: true, fontSize: 14}, {text: response['destinataire'] + '\n\n', fontSize: 11}],
                                margin: [1,1, 0, 0], colSpan: 2
                            },
                            {}
                        ],
                        [
                            {
                                text: [{text: 'Lot \n', bold: true, fontSize: 14}, {text: response['lot'] + '\n\n', fontSize: 11}],
                                margin: [1,1, 0, 0], colSpan: 1
                            },
                            {
                                text: [
                                    {text: 'Date pérémption \n', bold: true, fontSize: 14}, 
                                    {text: response['date'] + '\n\n', fontSize: 11}
                                ],
                                margin: [1,1, 0, 0]
                            }
                        ],
                        [
                            {
                                text: [
                                    {text: 'Quantité \n', bold: true, fontSize: 14}, 
                                    {text: response['qte'] + '\n\n', fontSize: 11}
                                ],
                                margin: [1,1, 0, 0]
                            },
                            {
                                text: [
                                    {text: 'Numerotation \n', bold: true, fontSize: 14}, 
                                    {text: response['numerotation'] + '\n', fontSize: 11}
                                ],
                                margin: [1,1, 0, 0]
                            }
                        ],
                        [
                            {
                                text: [
                                    {text: 'Article \n', bold: true, fontSize: 14}, 
                                    {text: response['codeArticle'] + '\n\n', fontSize: 11}
                                ],
                                margin: [1,1, 0, 0]
                            },
                            {
                                text: [
                                    {text: response['designation'] + '\n', fontSize: 11}
                                ],
                                margin: [1,1, 0, 0]
                            }
                        ],
                        [
                            {
                                text: [
                                    {text: '\n' + response['codeUm'] + '\n', bold: true, fontSize: 52, alignment: 'center'},
                                    {text: '------------------------------- \n\n ', fontSize: 10, alignment: 'center'}
                                ], 
                                colSpan: 2
                            },
                            {}
                        ],
                    ]
                  }
            }
          ],
            pageMargins : [5, 5, 5, 0],   
            pageSize: {
                width: 385,
                height: 480
            }
          
        }
    
        pdfMake.createPdf(dd).open();  
        this.setPrinted(id);
      }
    )
  }

  confirmAll(): void {
    let body = this.selectedRepartitions.map(({date}) => date / 1000);
    
    this._umeDetailService.updateEmplacement(this.ume.id, this.idArticle, body).subscribe(
      () => {
        this._umeDetailService.getColisApiData(this.ume.id, this.idArticle);
        Swal.fire(
          {
            position: 'top-end',
            icon: 'success',
            title: 'Modifier!',
            html: `Emplacement confirmé.`,
            showConfirmButton: false,
            timer: 1500
          }
        );
      }
    );

    this.modalService.dismissAll();
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
            id : colis.id
          }        
          
          this._umeDetailService.updateColis(body).subscribe(
            response => {
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
              ).then (
                res => {
                  colis.emplacementConfirme = response.emplacementConfirme;
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

  //#region search

  public colisTemp: any[] = [];

  public previousCodeUMFilter = '';
  public codeUMFilter = '';

  public previousBcsFilter = '';
  public bcsFilter = '';

  public selectStatut: any = [
    { name: 'Tous', value: '' },
    { name: 'Assigné', value: 0 },
    { name: 'Assigné et Confirmé', value: 1 },
    { name: 'Stock', value: 2 },
  ];

  public selectedStatut = this.selectStatut[1];
  public previousStatutFilter = '';

  filterByCodeUM(event) {
    const filter = this.codeUMFilter;
    this.previousCodeUMFilter = filter;
    this.colisTemp = this.filterRows(filter, this.previousBcsFilter, this.previousStatutFilter);
    this.ume.colis = this.colisTemp;
  }

  filterByBcs(event) {
    const filter = this.bcsFilter;
    this.previousBcsFilter = filter;
    this.colisTemp = this.filterRows(this.previousCodeUMFilter, filter, this.previousStatutFilter);
    this.ume.colis = this.colisTemp;
  }

  filterByStatut(event) {    
    console.log(event);
    
    const filter = event ? event.value : '';
    this.previousStatutFilter = filter;
    this.colisTemp = this.filterRows(this.previousCodeUMFilter, this.previousBcsFilter, filter);
    this.ume.colis = this.colisTemp;
  }

  filterRows(CodeUMFilter, BcsFilter, StatutFilter): any[] {         
    let res = (this.colisTempData as Colis[]).filter(row => {    
      const isPartialCodeUMMatch = (row?.ums?.bcs?.destinataire?.codeUM + '').toLowerCase().indexOf(CodeUMFilter) !== -1 || CodeUMFilter === '';
      const isPartialBcsMatch = (row?.ums?.bcs?.numeroCommande + '').toLowerCase().indexOf(BcsFilter) !== -1 || BcsFilter === '';
      const isPartialStatutMatch = (
        StatutFilter == 0 
        ? row.ums && row.emplacementConfirme == null
        : StatutFilter == 1
        ? row.ums && row.emplacementConfirme != null
        : row.ums == null
      ) || StatutFilter === '';        

      return isPartialCodeUMMatch && isPartialBcsMatch && isPartialStatutMatch;
    });

    this.totalQte = res.reduce((accumulator, current) => {
      return accumulator + current.quantiteProduit;
    }, 0);    
    
    return res;
  }

  clearSearch() {
    this.filterByCodeUM(this.codeUMFilter = '');
    this.filterByBcs(this.bcsFilter ='');
    this.filterByStatut(this.selectedStatut = this.selectStatut[1]);
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
              this._umeDetailService.deleteUme().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'l\'article à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/articles/list']);
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
              dateReception: formatDate((form?.value?.dateReception['year'] + '-' + form?.value?.dateReception['month'] + '-' + form?.value?.dateReception['day']), 'yyyy-MM-dd', 'en'),
              idZoneDepot: form.value.zoneDepot
            }
                         
            this._umeDetailService.updateUme(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `les données de L'UME on été bien modifiées.`,
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
          else if ( result.dismiss === Swal.DismissReason.cancel ) 
          {
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

  setPrinted(id) {
    let body = {
      id: id
    }
                   
    this._umeDetailService.updateSetPrinted(body).subscribe(
      () => {
        this._umeDetailService.getColisApiData(this.ume.id, this.idArticle);
      }
    );
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
          this._umeDetailService.delier(colis.id).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Modifiées!',
                  html: `les données de L'UME on été bien modifiées.`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                res => {
                  colis.emplacementConfirme = null;
                  colis.ums = null;
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
        else if ( result.dismiss === Swal.DismissReason.cancel ) 
        {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'Colis n\'a pas été délier',
            'error'
          );
        }
      }
    );
  }

  //#endregion

  //#region modals
  private action: number;

  modalConfirm(modal, action: number): void {
    if ((this.selectedStatut.value == 0 || this.selectedStatut.value == 1) || this.selectedStatut.value != '' ) {      
      this.action = action;
  
      this._scriptService.getStatDataByUme(this.ume.id).subscribe(
        response => {          
          this.repartition = response.map(
            (e,i) => {
              let name = e['statut'] == 1 ? formatDate(e['dateC'], 'dd-MM-yyyy HH:mm','en') + ' | En cours' : formatDate(e['dateC'], 'dd-MM-yyyy HH:mm','en');
              return {
                id: i, 
                name: name,
                date: e['dateC']
              }
            }
          );
  
          if (this.repartition.length > 0) {
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
        }
      )
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Sélectionné (Asigné ou Asigné et confirmé) pour imprimer une étiquette'
      });
    }
  }
  
  modalOpenForm(modalForm): void {    
    this.modalService.open(modalForm);
  }

  confirm() {
    if (this.action == 0) 
      this.confirmAll();
    else if (this.action == 1)
      this.print();
    else
      this.repartir();
  }

  updateNav() {
    this._router.navigate([`/ume/edit/${this.ume.id}`]);
  }


  onRepartitionSelect(items) {        
    this.selectedRepartitions = items;
  }

  clear(item) {
    this.selectedRepartitions = this.selectedRepartitions.filter(el =>{ return  el.name !== item.name});
  }

  //#endregion

  //#region hooks

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._umeDetailService.onUMEDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.ume = response;            
        let d = new Date(this.ume.dateReception);
        this.date = new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());     
      }
    );     

    this._umeDetailService.onColisDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {        
        this.ume.colis = response;
        this.colisTemp = this.ume.colis; 
        this.colisTempData = this.ume.colis; 
        this.idArticle = this.ume.colis[0]?.article?.id;        
        
        this.ume.colis = this.filterRows('', '', 0);
      }
    );      

    this._zoneListService.getZONEsDataRows().then(
      ( response: any ) => {
        this.zone = response;
        console.log(response);
      }
    )

    let title = this.edit ? 'Modification' : 'Détail';

    this.contentHeader = {
      headerTitle: title,
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
            name: this.ume.id,
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

  //#endregion
}
