import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Colis } from '../../entree/ume.model';
import { UnitemanutentionentreeDetailService } from '../../entree/unitemanutentionentree-detail/unitemanutentionentree-detail.service';
import { ColisList, UMS } from '../ums.model';
import { UnitemanutentionsortieDetailService } from './unitemanutentionsortie-detail.service';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 

import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { ScriptHistoryService } from 'app/main/script/script-history/script-history.service';
import { UnitemanutentionsortieListService } from '../unitemanutentionsortie-list/unitemanutentionsortie-list.service';

@Component({
  selector: 'app-unitemanutentionsortie-detail',
  templateUrl: './unitemanutentionsortie-detail.component.html',
  styleUrls: ['./unitemanutentionsortie-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }] 
})
export class UnitemanutentionsortieDetailComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  public contentHeader: Object;

  public lignesColis;
  public ColumnMode = ColumnMode;
  public selectedOption = 25;

  public dateExp: Date = null;

  public ums: UMS;
  
  public edit: boolean;
  public poidUnset: boolean = false;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('umsForm') umsForm: NgForm;

  public temp: ColisList[] = [];
  private tempData: ColisList[] = [];

  public selectEmplacement: any = [
    { name: 'Tous', value: '' },
    { name: 'Emplacement confrimé', value: 1 },
    { name: 'Emplacement non confirmé', value: 0 }
  ];

  public selectedEmplacement = [];

  public articleFilter = '';

  public numeroLotFilter = '';

  public qteColisFilter = '';

  public datePeremptionFilter = '';

  public dateOuverture: NgbDateStruct;
  public dateFermeture: NgbDateStruct;
  public dateExpedition: NgbDateStruct;

  constructor(
    private _umsDetailService: UnitemanutentionsortieDetailService,
    private _umsListService: UnitemanutentionsortieListService,
    private _umeDetailService: UnitemanutentionentreeDetailService,
    private _scriptHistoryService: ScriptHistoryService,
    private _router: Router,
    private calendar: NgbCalendar
  ) {     
    this.dateOuverture = calendar.getToday();
    this.dateFermeture = calendar.getToday();
    this.dateExpedition = calendar.getToday();

    this.edit = _umsDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

  //#region documents 

  colisageByUms() {
    this._scriptHistoryService.colisageByUms(this.ums.id).subscribe(
      response => {         
        console.log(response);
        this.generateListeColisage(response, 'open');
      }
    );
  }

  stockByBcs(id: number) {
    this._scriptHistoryService.stockByBcs(id).subscribe(
      response => {         
        console.log(response);

        if (response) {
          let stock = [];
          stock.push(response);
          this.generateStockPDF(stock, 'open');
        } else {
          Swal.fire(
            {
              icon: 'info',
              title: 'Oops...',
              text: 'Aucun document trouvé!',
            }
          );
        }
      }
    );
  }

  generateStockPDF(body: any[], action: String) {  
    let blRows: any[] = [];
    // debugger;

    body.forEach(
      (el, i) => {       
        let lignes = [];
        lignes.push(...
          el.stock.map(
            el => [
              {text: el.zoneDepot , margin: 5, fontSize: 8, alignment: 'center'}, 
              {text: el.nlot , margin: 5, fontSize: 8, alignment: 'center'}, 
              {text: el.ume , margin: 5, fontSize: 8, alignment: 'left'}, 
              {text: el.codeArticle , margin: 5, fontSize: 8, alignment: 'left'}, 
              {text: el.designationArticle , margin: 5, fontSize: 8, alignment: 'left'}, 
              {text: formatDate(el.datePeremption, 'dd-MM-yyyy', 'en') , margin: 5, fontSize: 8, alignment: 'center'}, 
              {text: el.qteColis , margin: 5, fontSize: 8, alignment: 'center'}
            ]
          )
        );       

        lignes.unshift(
          [
            {text: 'Zone dépôt', fontSize: 9, style: 'tableHeader', alignment: 'center'},
            {text: 'N° Lot', fontSize: 9, style: 'tableHeader', alignment: 'center'},
            {text: 'Ume', fontSize: 9, style: 'tableHeader', alignment: 'center'},
            {text: 'Code article', fontSize: 9, style: 'tableHeader', alignment: 'center'},
            {text: 'Désignation', fontSize: 9, style: 'tableHeader', alignment: 'center'},
            {text: 'Date de péremption', fontSize: 9, style: 'tableHeader', alignment: 'center'}, 
            {text: 'Qté colis', fontSize: 9, style: 'tableHeader', alignment: 'center'},
          ]
        );

        const data = [
          {
            table : {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    columns : [
                      {
                        margin: [0, 10, 0, 30],
                        image: 'data:image/png;base64,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',
                        width: 70, 
                        height: 40
                      },
                      {
                        text: [
                          { text: 'Crossdock \n', fontSize: 14, color: '#3b96d2' },
                          { text: 'Remettant pour le compte de tiers \n', fontSize: 9 },
                          { text: '122 Allée de la lavande \n', fontSize: 9 },
                          { text: '84300 Cavaillon \n', fontSize: 9 },
                        ]                  
                      },
                      {
                        width: '*',
                        text: 
                        [
                          { 
                            text: '\n Stock \n', 
                            fontSize: 12, 
                            bold: true 
                          }
                        ],
                        fontSize  : 10,
                        alignment : 'right'
                      }
                    ]
                  }
                ],
                // [
                //   {
                //     columns: [
                //       {
                //         width: '50%',
                //         margin: [20,10,0,10],
                //         text: [
                //           { text: 'Expéditeur\n', fontSize: 8, bold: true, color: '#3b96d2' },
                //           { text: el.destinataire?.nom + '\n', fontSize: 9 },
                //           { text: el.destinataire.adresselivraisonComplement1 + '\n', fontSize: 9 },
                //           { text: el.destinataire.adresselivraisonNumero + ' ' +  el.destinataire.adresselivraisonRue + '\n', fontSize: 9 },
                //           { text: el.destinataire.adresselivraisonCodepostal + ' ' +  el.destinataire.adresselivraisonLocalite + '\n', fontSize: 9 },
                //         ]
                //       },
                //       {
                //         width: '50%',
                //         margin: [10,10,0,10],
                //         text: [
                //           { text: 'Adresse de livraison\n', fontSize: 8, bold: true, color: '#3b96d2' },
                //           { text: el.destinataire.codeUM + ' ', bold: true, fontSize: 9 },
                //           { text: el.destinataire.nom + '\n', fontSize: 9 },
                //           { text: el.destinataire.adresselivraisonNumero + ' ' + el.destinataire.adresselivraisonRue + '\n', fontSize: 9 },
                //           { text: el.destinataire.adresselivraisonCodepostal + ' ' + el.destinataire.adresselivraisonLocalite + '\n', fontSize: 9 },
                //           { text: el.destinataire.telephone + '\n', fontSize: 9 },
                //         ]
                //       }
                //     ]
                //   }
                // ],
                [
                  {
                    fontSize: 10,
                    stack: [
                      {
                        style: 'tableExample',
                        table: {
                          widths: [60, 60, 30, 60, 150, 60, 40],
                          headerRows: 1,
                          alignment: 'center',
                          body: lignes
                        },
                        layout: 'lightHorizontalLines'
                      },
                    ]
                  }
                ],
              ]
            },
            layout: {
              hLineWidth: function(i, node) { return (i === 1 || i === 2) ? 1 : 0; },
              vLineWidth: function(i, node) { return 0; },
              hLineColor: function(i, node) { return (i === 1 || i === 2) ? 'white' : 'white'; },
              vLineColor: function(i, node) { return 'white' },
              paddingBottom: function(i, node) {
                switch (i) {
                  case 0:
                    return 5;
                  case 1:
                    return 2;
                  default:
                    return 0;
                }
              },
              paddingTop: function(i, node) {
                switch (i) {
                  case 0:
                    return 0;
                  case 1:
                    return 2;
                  default:
                    return 10;
                }
              }
            }
          }
        ];
        
        blRows.push(data);

        if (i != (body.length - 1)) {
          blRows.push({text: '', pageBreak: 'before'});
        }
        // debugger
      }
    );

    let docDefinition = {
      pageSize : 'LETTER',
      pageMargins : [25, 25, 25, 35],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },
      info: {
        title: 'Stock',
        author: 'Crossdock',
        keywords: 'cdk, crossdock',
      },

      content : blRows,

      footer : function(currentPage, pageCount) {
        return [
          {
            alignment : 'center',
            text      : currentPage.toString() + ' sur ' + pageCount,
            fontSize  : 8
          }
        ]
      },
    };

    pdfMake.createPdf(docDefinition).open();         
  }
  
  generateListeColisage(body: any[], action: String) {  
    let blRows: any[] = [];
    // debugger;
     
    let lignes = [];

    lignes.push(...
      body['colis'].map(
        el => [
          {text: el.id , margin: 5, fontSize: 8, alignment: 'center'}, 
          {text: el.article.codeClient , margin: 5, fontSize: 8, alignment: 'center'}, 
          {text: el.article.designationClient , margin: 5, fontSize: 8, alignment: 'left'}, 
          {text: el.numeroLot , margin: 5, fontSize: 8, alignment: 'center'}, 
          {text: formatDate(el.datePeremption, 'dd-MM-yyyy', 'en') , margin: 5, fontSize: 8, alignment: 'center'}, 
          {text: el.quantiteProduit , margin: 5, fontSize: 8, alignment: 'center'},
        ]
      )
    );       

    lignes.unshift(
      [
        {text: 'Colis', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]},
        {text: 'Code article', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]},
        {text: 'Désignation', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]},
        {text: 'N° Lot', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]}, 
        {text: 'Date de péremption', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]},
        {text: 'Quantité', style: 'tableHeader', fontSize: 9, alignment: 'center', margin: [0,0,0,3]},
      ]
    );

    const data = [
      {
        table : {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                columns : [
                  {
                    margin: [0, 10, 0, 30],
                    image: 'data:image/png;base64,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',
                    width: 70, 
                    height: 40
                  },
                  {
                    text: [
                      { text: 'Crossdock \n', fontSize: 14, color: '#3b96d2' },
                      { text: 'Remettant pour le compte de tiers \n', fontSize: 9 },
                      { text: '122 Allée de la lavande \n', fontSize: 9 },
                      { text: '84300 Cavaillon \n', fontSize: 9 },
                    ]                  
                  },
                  {
                    width: '*',
                    text: 
                    [
                      { 
                        text: 'Liste de colisage UMS N° ' + body['ums'].numero + '\n', 
                        fontSize: 12, 
                        bold: true 
                      },
                      { 
                        text: '\n BC - '+ body['ums'].bcs.numeroCommande +'\n', 
                        fontSize: 12, 
                        bold: true 
                      },
                      { 
                        text: 'Date : ',
                        bold: true
                      },
                      formatDate(body['ums'].bcs.dateCommande, 'dd-MM-yyyy', 'en') + '\n',
                      { 
                        text: 'Code UM : ',
                        bold: true
                      },
                      body['ums'].bcs.destinataire.codeUM + '\n',
                      { 
                        text: 'Qté : ',
                        bold: true 
                      },
                      body['qteColis']
                    ],
                    fontSize  : 10,
                    alignment : 'right'
                  }
                ]
              }
            ],
            [
              {
                columns: [
                  {
                    width: '50%',
                    margin: [20,10,0,10],
                    text: [
                      { text: 'Expéditeur\n', fontSize: 8, bold: true, color: '#3b96d2' },
                      { text: body['destinataire']?.nom + '\n', fontSize: 9 },
                      { text: body['destinataire'].adresselivraisonComplement1 + '\n', fontSize: 9 },
                      { text: body['destinataire'].adresselivraisonNumero + ' ' +  body['destinataire'].adresselivraisonRue + '\n', fontSize: 9 },
                      { text: body['destinataire'].adresselivraisonCodepostal + ' ' +  body['destinataire'].adresselivraisonLocalite + '\n', fontSize: 9 },
                    ]
                  },
                  {
                    width: '50%',
                    margin: [10,10,0,10],
                    text: [
                      { text: 'Adresse de livraison\n', fontSize: 8, bold: true, color: '#3b96d2' },
                      { text: body['ums']['bcs']['destinataire'].codeUM + ' ', bold: true, fontSize: 9 },
                      { text: body['ums']['bcs']['destinataire'].nom + '\n', fontSize: 9 },
                      { text: body['ums']['bcs']['destinataire'].adresselivraisonNumero + ' ' + body['ums']['bcs']['destinataire'].adresselivraisonRue + '\n', fontSize: 9 },
                      { text: body['ums']['bcs']['destinataire'].adresselivraisonCodepostal + ' ' + body['ums']['bcs']['destinataire'].adresselivraisonLocalite + '\n', fontSize: 9 },
                      { text: body['ums']['bcs']['destinataire'].telephone + '\n', fontSize: 9 },
                    ]
                  }
                ]
              }
            ],
            [
              {
                fontSize: 10,
                stack: [
                  {
                    style: 'tableExample',
                    table: {
                      widths: [50, 70, 160, 70, 80, 50],
                      headerRows: 1,
                      alignment: 'center',
                      body: lignes
                    },
                    layout: 'lightHorizontalLines'
                  },
                ]
              }
            ],
          ]
        },
        layout: {
          hLineWidth: function(i, node) { return (i === 1 || i === 2) ? 1 : 0; },
          vLineWidth: function(i, node) { return 0; },
          hLineColor: function(i, node) { return (i === 1 || i === 2) ? 'white' : 'white'; },
          vLineColor: function(i, node) { return 'white' },
          paddingBottom: function(i, node) {
            switch (i) {
              case 0:
                return 5;
              case 1:
                return 2;
              default:
                return 0;
            }
          },
          paddingTop: function(i, node) {
            switch (i) {
              case 0:
                return 0;
              case 1:
                return 2;
              default:
                return 10;
            }
          }
        }
      }
    ];
    
    blRows.push(data);

    let docDefinition = {
      pageSize : 'LETTER',
      pageMargins : [25, 25, 25, 50],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },
      info: {
        title: 'Liste de Colisage',
        subject: 'liste de colisage',
        author: 'Crossdock',
        keywords: 'cdk, crossdock',
      },

      content : blRows,

      footer : function(currentPage, pageCount) {
        return [
          {
            margin: [0, 10, 0, 0],
            alignment : 'center',
            text      : currentPage.toString() + ' sur ' + pageCount,
            fontSize  : 8
          }
        ]
      },
    };

    pdfMake.createPdf(docDefinition).open();         
  }

  //#endregion

  //#region search filter for colis list

  filterByDatePeremption() {
    let date : string | number = '';

    if (this.datePeremptionFilter) {
      let day = this.datePeremptionFilter['day'];
      let month = this.datePeremptionFilter['month'];
      let year = this.datePeremptionFilter['year'];

      date = new Date(year, month - 1, day).getTime();
    }

    return date;
  }

  filterByEmplacement() {
    return this.selectedEmplacement ? this.selectedEmplacement['value'] : '';
  }

  filterRows(ArticleFilter, NumeroLotFilter, QteColisFilter, DatePeremptionFilter, EmplacementFilter): any[] {   
        
    return this.tempData.filter(row => {
      const isPartialArticleMatch = ((row.article.designationClient + '').toLowerCase().indexOf(ArticleFilter) !== -1 || (row.article.codeClient + '').toLowerCase().indexOf(ArticleFilter) !== -1) || ArticleFilter === '';
      const isPartialNumeroLotMatch = (row.numeroLot + '').indexOf(NumeroLotFilter) !== -1 || NumeroLotFilter === '';
      const isPartialQteColisMatch = row.quantiteProduit == QteColisFilter || QteColisFilter === '';
      const isPartialDatePeremptionMatch = row.datePeremption == DatePeremptionFilter || DatePeremptionFilter === '';
      const isPartialEmplacementMatch = (EmplacementFilter == 1 ? row.emplacementConfirme != null : row.emplacementConfirme == null) || EmplacementFilter === '';
      return isPartialArticleMatch && isPartialNumeroLotMatch && isPartialQteColisMatch && isPartialDatePeremptionMatch && isPartialEmplacementMatch;
    });
  }

  search() {
    this.temp = this.filterRows(this.articleFilter, this.numeroLotFilter, this.qteColisFilter, this.filterByDatePeremption(), this.filterByEmplacement());
    this.lignesColis = this.temp;
  }

  clear() {
    this.articleFilter = '';
    this.numeroLotFilter = '';
    this.qteColisFilter = '';
    this.datePeremptionFilter = '';
    this.selectedEmplacement = null;
    this.search();
  }

  //#endregion

  //#region forms & submits
  
  printEtiquette() {  
    const data = [
      {
        style: 'tableExample',
        table: {
          style: 'table',
          heights: [50, 50],
          widths: ['50%', '50%'],
          body: [
            [
              {text: [{text: 'Expéditeur \n\n', bold: true, fontSize: 14}, {text: 'GROUPE ETHIQUE ET SANTE', fontSize: 12}],
              style: 'tableExample', margin: [6,6], colSpan: 1, alignment: 'center'},
              {text: [{text: 'Destinataire \n\n', bold: true, fontSize: 14}, {text: this.ums.bcs.destinataire.nom, fontSize: 12}],
              style: 'tableExample', margin: [6,6], colSpan: 1, alignment: 'center'}
            ],
            [
              {text: [{text: 'N° commande \n\n', bold: true, fontSize: 14}, {text: this.ums.bcs.numeroCommande, fontSize: 12}
            ],
            style: 'tableExample', margin: [6,6], colSpan: 1, alignment: 'center'},
            {text: [{text: 'N° UM: \n\n', bold: true, fontSize: 14}, {text: this.ums.numero, fontSize: 12}],
            style: 'tableExample', margin: [6,6], colSpan: 1, alignment: 'center'}],
          ]
        }
      },
      {
        style: 'tableExample',
        table: {
          style: 'table',
          heights: [200],
          widths: ['75%', '25%'], 
          body: [
            [{text: [{text: 'Code UM: \n\n\n\n', bold: true, fontsize: 14}, {text: this.ums.bcs.destinataire.codeUM, fontSize: 60}],
            style: 'tableExample', margin: [50,6], colSpan: 1, alignment: 'center'}, 
            {text: [{text: 'Poids brute: \n\n\n\n\n', bold: true}, {text: this.ums.poidsBrut + ' kg', fontSize: 20}],
            style: 'tableExample', margin: [6,6], colSpan: 1, alignment: 'center'}],
          ]
        }
      },
    ];

    let docDefinition = {
      styles: {
        tableExample: {
          margin: [0, 5, 0, -6]
        }
      },

      pageSize : {
        width: 480,
        height: 380
      },
      
      pageMargins : [5, 5, 5, 0],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },

      content : data
    };

    pdfMake.createPdf(docDefinition).open();  
  }

  poidBrutValueChanged() {
    if(this.ums.poidsBrut == null)
      this.poidUnset = true;
    else
      this.poidUnset = false;
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
              id: this.ums.id,
              dateExpedition: form.value.dateExpedition ? formatDate(new Date(form.value.dateExpedition['year'], form.value.dateExpedition['month'] - 1, form.value.dateExpedition['day']), 'yyyy-MM-dd', 'en') : '', 
              poidsBrut: form.value.poidsBrut, 
            };                 
           
            this._umsDetailService.updateUms(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `les données on été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  res => {
                    this.edit = false;
                    this._router.navigate([`/ums/detail/${this.ums.id}`]);
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
              'Rien n\'a été modifié',
              'error'
            );
          }
        }
      );  
    }
  }

  confirmerEmplacementColis(colis: Colis) {    

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
        confirmButtonText: 'Oui, confirmez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
    .then(
      (result) => {       
        if (result.isConfirmed) {  
          let body = {
            id : colis.id
          };      
          console.log(body);

          this._umeDetailService.updateColis(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Confirmation!',
                  html: `L\'emplacement de colis et confirmé`,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then (
                res => {
                  this._umsDetailService.getApiData(this.ums.id);
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

  closeUms() {   
    if (this.ums.poidsBrut == null) {
      this.poidUnset = true;
    } else {
      let confirmed = this.ums.colisList.filter(el => { return el.emplacementConfirme != null});
  
      const swalWithBootstrapButtons = Swal.mixin(
        {
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger sup'
          },
          buttonsStyling: false
        }
      );
  
      let text = "Vous ne pourrez pas revenir en arrière !";
  
      if (confirmed.length == 0) {      
        text = "Voulez-vous vraiment clôturer cette UM, vous n'avez pas confirmé aucun colis, en continuant tous les colis de cette UM seront confirmés automatiquement.";
      }
      
      swalWithBootstrapButtons.fire(
        {
          title: 'Vous êtes sûr ?',
          text: text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oui, Clôturez-le!',
          cancelButtonText: 'Non, annulez!',
          reverseButtons: true
        }
      )
      .then(
        (result) => {       
          if (result.isConfirmed) {  
            let body = {     
              id: this.ums.id,
              idBcs: this.ums.bcs.id,
              numero: this.ums.numero,
              poidsBrut: this.ums.poidsBrut,
              confirmAll: confirmed.length > 0 ? false : true
            };            
            
            this._umsDetailService.closeUms(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Clôture!',
                    html: `l'UM a été clôturée avec succès`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  res => {
                    this._umsDetailService.getApiData(this.ums.id);
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
          else if ( result.dismiss === Swal.DismissReason.cancel ) 
          {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Rien n\'a été modifié',
              'error'
            );
          }
        }
      ); 
    }
  }

  //#endregion

  //#region hooks

  ngOnInit(): void {
    this._umsDetailService.onUMSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.ums = response;

        this.dateOuverture = {
          day: new Date(this.ums.dateOuverture).getDate(),
          month: new Date(this.ums.dateOuverture).getUTCMonth() + 1,
          year: new Date(this.ums.dateOuverture).getUTCFullYear()
        };

        this.dateFermeture = this.ums.dateFermeture ? {
          day: new Date(this.ums.dateFermeture).getDate(),
          month: new Date(this.ums.dateFermeture).getUTCMonth() + 1,
          year: new Date(this.ums.dateFermeture).getUTCFullYear()
        } : null;

        this.dateExpedition = this.ums.dateExpedition ? {
          day: new Date(this.ums.dateExpedition).getDate(),
          month: new Date(this.ums.dateExpedition).getUTCMonth() + 1,
          year: new Date(this.ums.dateExpedition).getUTCFullYear()
        } : null;

        this.lignesColis = this.ums.colisList;
        this.tempData = this.lignesColis;
      }
    ); 
    
    let title = this.edit ? 'Modification' : 'Détail N° ' + this.ums.numero;

    this.contentHeader = {
      headerTitle: 'Unité manutention sortie',
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
            name: 'Ums',
            isLink: true,
            link: '/ums/list'
          },
          {
            name: title,
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
