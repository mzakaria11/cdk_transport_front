import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { BCS } from 'app/main/bonCommand/sortie/bcs.model';
import {
  ApexChart,
  ApexStroke,
  ApexDataLabels,
  ApexXAxis,
  ApexTooltip,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
  ApexStates
} from 'ng-apexcharts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScriptHistoryService } from './script-history.service';
import Swal from 'sweetalert2';
import { ScriptDashboardService } from '../script-dashboard/script-dashboard.service';
import { formatDate } from '@angular/common';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import * as XLSX from "xlsx";

export interface ChartOptions2 {
  series?: ApexNonAxisChartSeries;
  chart?: ApexChart;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  colors?: string[];
  legend?: ApexLegend;
  labels?: any;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  markers?: ApexMarkers[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  states?: ApexStates;
}

@Component({
  selector: 'app-script-history',
  templateUrl: './script-history.component.html',
  styleUrls: ['./script-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScriptHistoryComponent implements OnInit {

  @ViewChild('apexRadialChartRef') apexRadialChartRef: any;
  public apexRadialChart: Partial<ChartOptions2>;

  chartColors = {
    donut: {
      series1: '#ffe700',
      series2: '#00d4bd',
      series3: '#826bf8',
      series4: '#2b9bf4',
      series5: '#FFA1A1'
    }
  };

  public ColumnMode = ColumnMode;
  public selectedOption = 25;
  
  public bcsList;
  public temp: any[] = [];
  
  private tempData: BCS[] = [];
  
  public dateCommandeFilter = '';
  public codeUmFilter = '';
  public numeroBcsFilter = '';
  
  public isMenuToggled = false;
  public contentHeader: Object;
  private _unsubscribeAll: Subject<any>;
  public volumes: any[] = [];

  constructor(
    private _coreConfigService: CoreConfigService,
    private _scriptHistoryService: ScriptHistoryService,
    private _scriptDashboardService: ScriptDashboardService,
  ) {    
    this._unsubscribeAll = new Subject();
    
    this.apexRadialChart = {
      series: [_scriptHistoryService.stat.colis, _scriptHistoryService.stat.enStock, _scriptHistoryService.stat.insuffisante],
      labels: ['Colis Assigné', 'Article En Stock', 'Article Insuffisant'],
      chart: {
        height: 400,
        type: 'radialBar'
      },
      colors: [this.chartColors.donut.series5, this.chartColors.donut.series2, this.chartColors.donut.series3],
      plotOptions: {
        radialBar: {
          // size: 185,
          hollow: {
            size: '25%'
          },
          track: {
            margin: 20
          },
          dataLabels: {
            name: {
              fontSize: '2rem',
              fontFamily: 'Montserrat'
            },
            value: {
              fontSize: '1rem',
              fontFamily: 'Montserrat'
            },
            total: {
              show: true,
              fontSize: '.8rem',
              label: 'Colis',
              formatter: function (w) {
                return _scriptHistoryService.stat.colis + "%";
              }
            }
          }
        }
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      stroke: {
        lineCap: 'round'
      }
    };
  }

  exportXlsx($event) {
    if (this.volumes.length > 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.volumes);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
  
      console.log(ws);
      
      XLSX.utils.book_append_sheet(wb, ws, 'volumes et poids');
  
      XLSX.writeFile(wb, "volumes_poids.xlsx");
    }
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    console.log(val);
    
    const temp = this.tempData.filter(function (d) {
      return (d.destinataire?.codeUM + '').indexOf(val) !== -1
      || !val;
    });

    this.bcsList = temp;
  }

  //#region Documents

  etiquetteClientMass() {  
    let blRows: any[] = [];

    this.bcsList = this.bcsList.sort(
      (a, b) =>  parseInt((a.destinataire.codeUM + "").split((a.destinataire.codeUM + "").charAt(0))[1]) - parseInt((b.destinataire.codeUM + "").split((b.destinataire.codeUM + "").charAt(0))[1])
    );

    this.bcsList.forEach(
      (el, i) => {       
        console.log(el);
        
        const data = [
          {
            table: {
              style: 'table',
              heights: [300],
              widths: ['100%'],
              body: [
                [
                  {
                    text: [
                      { text: 'Code UM \n\n\n\n', bold: true, fontSize: 14 }, 
                      { text: el.destinataire.codeUM, bold: true, fontSize: 120 }
                    ],
                    margin: [60,10], colSpan: 1, alignment: 'center'
                  }
                ]
              ]
            }
          }
        ];
        blRows.push(data);

        if (i != (this.bcsList.length - 1)) {
          blRows.push({text: '', pageBreak: 'before'});
        }
      }
    );

    let docDefinition = {
      pageSize : {
        width: 480,
        height: 380
      },
      
      pageMargins : [5, 30, 5, 0],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },

      content : blRows
    };

    pdfMake.createPdf(docDefinition).open();         
  }

  etiquetteClient(bcs) {  
    let blRows: any[] = [];

    const data = [
      {
        table: {
          style: 'table',
          heights: [300],
          widths: ['100%'],
          body: [
            [
              {
                text: [
                  { text: 'Code UM \n\n\n\n', bold: true, fontSize: 14 }, 
                  { text: bcs.destinataire.codeUM, bold: true, fontSize: 120 }
                ],
                margin: [60,10], colSpan: 1, alignment: 'center'
              }
            ]
          ]
        }
      }
    ];

    let docDefinition = {
      pageSize : {
        width: 480,
        height: 380
      },
      
      pageMargins : [5, 30, 5, 0],

      content : data
    };

    pdfMake.createPdf(docDefinition).open();         
  }

  blByBcs(id: number) {    
    this._scriptHistoryService.blByBcs(id).subscribe(
      response => {         
        if (response.length > 0) {
          this.generateBlPDF(response, 'open');
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

  colisageByBcs(id: number) {
    this._scriptHistoryService.colisageByBcs(id).subscribe(
      response => {         
        console.log(response);

        this.generateListeColisage(response, 'open');
      }
    );
  }

  stockByBcs(id: number) {
    this._scriptHistoryService.stockByBcs(id).subscribe(
      (response: any) => {         
        if (response.stock.length > 0) {
          let stock = [];
          stock.push(response);
          this.generateStockPDF(stock, 'open');
        } else {
          console.log("else");
          
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
  
  colisagesMass() {    
    this._scriptDashboardService.colisage(this._scriptHistoryService.ts).subscribe(
      response => {
        this.generateListeColisage(response, 'open');
      }
    );
  }

  blsMass() {
    this._scriptDashboardService.generatedBls(this._scriptHistoryService.ts).subscribe(
      response => {
        if (response.length > 0) {
          this.generateBlPDF(response, 'open');
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
    )
  }
  
  volumesMass() {
    if (this.volumes?.length > 0) {
      this.generateVolumePDF(this.volumes, 'open');
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
  
  stocksMass() {
    this._scriptDashboardService.stockUms(this._scriptHistoryService.ts).subscribe(
      (response: any) => {
        console.log(response);
        
        if (response[0].stock.length > 0) {
          this.generateStockPDF(response, 'open');
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

  generateListeColisage(body: any[], action: String) {  
    let blRows: any[] = [];
    // debugger;

    body.forEach(
      (el, i) => {       
        let lignes = [];
        console.log(el);
        
        lignes.push(...
          el.colis.map(
            el => [
              {text: el.id , margin: 5, fontSize: 9, alignment: 'center'}, 
              {text: el.article.codeClient , margin: 5, fontSize: 9, alignment: 'center'}, 
              {text: el.article.designationClient , margin: 5, fontSize: 9, alignment: 'left'}, 
              {text: el.numeroLot , margin: 5, fontSize: 9, alignment: 'center'}, 
              {text: formatDate(el.datePeremption, 'dd-MM-yyyy', 'en') , margin: 5, fontSize: 9, alignment: 'center'}, 
              {text: el.quantiteProduit , margin: 5, fontSize: 9, alignment: 'center'},
            ]
          )
        );       

        lignes.unshift(
          [
            {text: 'Colis', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]},
            {text: 'Code article', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]},
            {text: 'Désignation', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]},
            {text: 'N° Lot', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]}, 
            {text: 'Date de péremption', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]},
            {text: 'Quantité', style: 'tableHeader', fontSize: 10, alignment: 'center', margin: [0,0,0,3]},
          ]
        );

        const data = [
          {
            table : {
              headerRows: 2,
              widths: ['*'],
              body: [
                [
                  {
                    columns : [
                      {
                        margin: [10, 10, 0, 30],
                        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAA4CAYAAAC8E6X/AAAACXBIWXMAAAsSAAALEgHS3X78AAAUYElEQVR4nO1be1zT5f5/EpCNId9twMZWDraJtzFwSQqE0KYgeMEDahgGR8nSrGHp6YQl/VQoOV28zTKssERJzOBomSjKEjkgHBS5TDPZQNQxBhsbMhjC7Lye7/alr5OLwPCcP37vf2DP7fvsvc/zuT7fp/744w/w/xgZ7P9bvN1saJ5QXq2YU1ZV7wsAmAwAcLYaogMA/B4Zwi+bMZ11ieGO9PyXtjognqjkVV5rdD5xrnJFYen1WFWrPgQAMP4xpxonedLyg/0n5wimsa5UXm8UqVr0z+YX1UwHAJABAAQ4hoqQVLP8OFeoCKl47UsvnGO4I51j+X2eCHmV1xrpn32Tv7m8un4NAIBky7WpCOlKRAj/+9l+nGIqmSSb7ce5Z8v1B8OYHtumFr3Dji9PvZdfVJNskQ6bYZIn7ag4fl56ZCi/aiy/w2AYM/JOX6iZtSEt+xAAYIot16UipMtrV7zw+uplwf8e4vl0AIDrjOmsOwx3pN2We8AwJuQlpWa/ll9UswsA4GTDZR/MmMbavX97/BZXsnPXAM99M7+oZjkAYAYAwAUAYFi1NHj1e+sW/oCNkRw6F3Ovs3vC8gj/n7296JrRbMjmOu/lTQfSy6vr37XpogA8iFscsHZr0pKvBxu0YM2uTGcnwlNz/L3zJ3nSSyND+Y3WY8qqFC5ancH3dFHNTFWLvmfJvBmXVkYFXhnJpmxKXlJq9sb8oprPbLagGcaIEH7C3pS4H/CNNxua6XW31I79ETQclFUp3LU6w4PIUP6wpdBm5CWlZq/OL6qBkjHOJgtaII6fu06cMC8D33bweHH4joxTmR5uyL+Lvk+OHmhuoVw/EQDgJ5Xr2VBdWppbhFykgUK0vypgkpSj2ZtNdJ7k0Lm5Y0HcLF/2UWviklKzN+UX1XwKAFCuXhr8hfWcQrneO0+mfaVSaYi2ON+PQKrosx83BExSXjSP+q2Ii9wY7v5sInmTwzZDd8F31As9DGPWp69yZvtxmrBWyaFzsZKs80cBAKb0vy0LjJk/8yGLKz5Zv61SafhgJA8TMEnpG4MZ77OphAePO2fUkgIlYQyIAxEh/A144sqqFK6SrPMHAQDtm9cunI8nrlCu94vO+q1spMRBVCoNyfHH6q7m1mqef9w5o5K80xdq+BvSsq/Y2uWZ5Ek79cvXby+yboeuiLcn7XdxwryzWNtnF5XReTLtYRu6RfeFHJcNqeGsL4caOCryFqzZlVd3S/2XES/QP+7v2RI3IzKUf32wQW1dvU/tvKh8V6poTwMA2PUz5L4XxbGATXEsEjBJ18lEe1TR6bp6aZVKw/RKpeEFndEUPNAPz6MTv0qP8HyDQrQfMCExYvIOHi+etSPjVKmtjURECH/r3pS4bUONE5+sT61UGrb006WO5lE/nu9NzvDxcOoYbI1aVafrmZu6V/Jk2o0AALp1v4BJOpwieiaB5uzQL0kjJi/kpfQSVas+cESTB4biQnbyVCz9JDl0DkYLWnHCvPP4GSlnG9+RKto/tl5FwCR9niJ65u80Zwc0m1KvNTrXt3UHSuV6GHHQAADwy94WcpEqNsWxnE0lGOE4dUePo6SkKVmqaN9iLYnuJPvMzGWT1lCI9o8QNSLyTl+omb0hLfvSKEjqF3GLA97YmrQEdT+aWvRIaFz6NQBAx+8FO/ri48wKdWxmhfqo1XxdrK/rKnEQ4wQwG5DJOdWt78qau17sJ0/YN4dHJx6P9XXbLeIiMsu86TsvKo/pjCYefmCiP+2NRH/aI27RiI7c6aKal0cybwioV0YFHMKGxCbth34jUxw/t0/CCuV6VmaFep/VMp0bgxkRkLi2rt7xa/PkaR8U3K6SNXclDkIcBFnW3LUGjl2bJ/+mXmt0FXGRa5IodiiZYFeNH5hZod5RKNd7Wi8wIvLyi2qiRjJvMKxaGrzN24uO6qgjJ0vDVK36ZVSEJIuLCoDuCTQQBElJ00kAgBt+mUR/WmKMj2uZuqMHic+5eUbW3PX+MNNfdpDo+GN1FUerWp9jUwma1HDWApjFxo1xkZQ05bR19T7E17DJg4YCAMAa7rwhcHf10uC+SEJy6Dzqr62MCtjmSnZGndadF5VvtRh6/fDLCDkuf0/0p+VUKg3MmMM3ynRG0wsDPAbqNng0LwAA5DDR0M8Yr32lquLMCnW0gEm6uz1sohAA0Ix1thh6Z+fJtMvwE4bln2l0HeMP/li8ffjcDI6IEH4Wwx0xAbOus6OSSc3jHexL46ICjgOzVfSQKtqT8YsImKTvU8NZn7R19dqnnG3M6S9v6EVxPLFoKuXz+ZPJv+JdjlpVp1P5nY6wn65rV7UYehfjXJ3xmRXqbAGTFCDiIlUNbd1vw8/YvNxaTVKiP+0Y9vmxJS/3zOU5gcs/vKxq1c+3JXEQL8ya8jP2PyTxQNqqFzevWxjrSnZGrVn6hbvQCiK4KabIKeQU+M8Xl1SvWPw1PB4IOS6vHY71/ssKP7cCa1/Nx8OpM9GfdiIvfmp0oj9tKfQJcd2ED6V3YOwMIqeQc/DHV2c0PY/XfUNKHrSsO748tV3Vqp9na5/OgqbQ2VPK8Q3PeFAePONBuQ3MYROroa37FXw/j07ctWAKRa7u6KGcvqGz9vXuR/OoCZvmMOEXx3y5Zbqu3pmWYpGS5uxwedFUyi9Qv0ESvSiOfjsvKo9jVlZ1r0ckKWlaJA5i/Bzr6/r3nGrNP7HFpXJ9goiLpILByNPoOoivf5CVdvV644YBPHibICKEv9eV7DygF59bq9mINwBkgl1dahjrPRhhrM2TZ0GuccPb3wz0WLzCz61I3dHzlKSk6X2por1fA5JTrenk0YlfJ4c+nSbiIr9RiPai7edvn2kx9EKfcFxOtebAoqmUydCKn/ldd1lnNM0E5ozMq21dvWnQ7+tXkppa9M4L1+z+5er1xo1jSRxU5JihgLrOurNea5wgVbSvxrcJucgOmrNDT55MG9Ni6F2I70v0p70GiavXGilr8+S/ShXtqYNYXidZc1cStLKFcv1zAiZJnRHNFZEJdtgxZeTKtEstzzyImzexoa0bljwfPYYwexGbtP+CVm8YyHLZDLAWK5jOaoPrbUjN3rJgza5jTS16V2z9XJn2r5ZaBIaGRH/aYShVubWarQ+RynHZCi2vuqPHQXyyPq/F0BvymPtkfVBwG1rZ52nODm2J/rT1WEel0oD6syIukoe30JVKQ0C/5EkOnftS1ap/dqyJg4gM4aOp9ZsNzc5Xrze+VXdLHalq0Zuwfqlcvw4/HuofCtH+fk51a6LOaPLB2skEu/Op4axtlqMMI4RQq0c1Cjku+6N51Ne2h018UchxEXtRHP+JIwS1suqOHpcYH9fzZIIdGj01tHXPqVV1kmHG2Z1k/y9ssXqtEdWND+m8pNTsV8qr65eBJwNYm0CtbHm1AroL5EmetG8F01nwmgWQlDQtwYdJ0OsXBzF+aOvqdcqp1nyI22HvxjlMqJdhJJDUYujFZ3luxfq6Jr8scD9OIdr3Yo0iLmq499WqOrnJ+beO6Iym2VACUwoa92REc1cLuchXeTItlC5HqUIf7uPhdMyH7nRCqmifA8xWF6b1/5S8sirF0/lFNZInRBw8sgXeXnQ0TXTk5KUEYHaK0ZgVSlBOtSYVP17IRfYDM0Fx+AyIgEk6CGNT6ELkybR9Pqg7yb4w68VJz4mDGEfxxOHh4+Ekz4r1DnMn2ZfBZllzV0KhXD8lhkeFUonOUXf0iCzPL8Sm1muNHgBP3pGTl+CvRxwLovpDZAgfJaryWiO77pY6DABQFxHCLwDm4wr1FR83TRfDox629L2Jazck+tPgcbWH4ROmH70ojrkZ0dxwNpXQMtQ+KET7exnR3EgY5UA+pHL9S2wqQetOsv8VmK3rc/CvD92pFvMHdUYTGjOj5Gl0HePyi2r+OpZkWcEQEcKHcSq4eq0RVrg0q5YGp2GhWK5Muwo/PNbX9UM2ldBxtKo1Smc09YVoQo5LCgyl8mTaeBg+AbPEXZFEsVfRnB1Mg20AD2goonlUVNIrlYYIYCYLc9y9gXkMdKewatuf5JVX1Qdb8l1PBDOmsTKwJMDqZcFFp756a/rqpcGoZEEF3dDWjde76lhfNwkMyveVqtKwRjLB7po4iLG7ravXIbNCjdUuGjOiufOgNA33e8TwqEegUEF/rl5rJAq5SLGla0K91oil+LHabnsfeb+W/2brpOagWL00+Bt8P7z2gMW2OdWtcfhUkoBJOklzdugubbz3HP4oB3pOyIQZ3tLGezDy8QLmcOojKEUj2ROUbC+K44/QiOqMJg6b4thXBtAZTeMte8F+FPT4ouTdVbX5DLCmzUFFSLWRofxr/a0LDYVU0f6QeyLkuKDuTOmte8txzV0LplDQgD37autrwHxca9YHeHw3mv0umkpBw7B6rdGTTSV0Wi5YPgIBk6TpI6+8up4/yJo2RUQI//BA6/VjKBRCLlKg7uhxkira47FGIcdlh4BJaoL5t4a2bphbNIqDGMspRHvjaPYq4iLQYBl1RtPTliY1vh+qCMu/6BUPzNpOHDu6HkLvyqgAGI+CrXtPLJUcOveQkbI2FNE86lcwhsypbl2P08kqcRDjE7M70wpT4+Ng7WIkFX9rQPUAbxHgyphoLcSL4mgAZqeZAsyS9xvAkUcdeunRY8Y01rfeXnTUYuUX1bwpyTr/QVOL/ilgNhTOVobCGMOjZsIMck615h2sUchx+Zzm7GCUyvWRLYZef2i5NwYz/mGrPQqYJLnV7VUVLqXFBGZjVQnGKMU0EO5vXrcQLSkePF4s0OoNIXGLA75huCNozk6qQEOxPkPBoxO/YFMJaqlcvwQnddCvQxMJmRXqt4GZzC8fx58bBmD22IANdyfZo/q5UK6nW1JaRgGThN5WeGLkTfKk/SCYzroD/z/4Y3Gq5Qij9+2spQu6AuJABup34Y+ykOPyESTqaFVrkM5ogla2K8bHdaeNtwqJw6zqeB+6E0qUuqMHjZfdSfY/QcsMcOSpB1rJVlgZFYCW7k5fqPFVteoXTvKk/ejtRUefm2dO/fT5mUKOy3c+Hk66SqXBs6GtO8zSfFccxPjMousk4E/DMaprYtYQMEkdZILdHUszlUd3Mkc9Cj2MQkCsr9tebApKHhUhNYwlcR5uyJmVUYElwBxDCwB6727eHqw/t1azBjf8gZCLSCztq7B8YjSPKoEKXSrXL24x9D5rIfORwvdoUak0IGwq4QYshEPJE3GRIngyZM1d0WSC3dUVfm6Y82wmb5InbSxvlHdvXrdQjH3YmrTkuz1b4vwiQ/loMH60qtVPZzT15d54dGKGiIvcVHf02EkV7diRhbHtAWDWdWgGJZpH3WexjrYG1Gm3aps7p3tRHM/DsEwq10PpR4Rc5KGaMUrebD/Ov8ZgEyhm+bIPRYbyb+LbIkP5fUXlnOrWHTj1oREHMt6ztK/GIodYX9d32VRC29Gq1jCd0STCk2lreFEc0UyyrLnz+RgeFa2D5Mq00Mf8PdGflvUIebP8OEVjRV5M+MzPB+qDOq3F0BuJfYblRKjrgLnGgBkQ5aKpFNSw7CtVoSknIcdlN8x8jMV+KUR71F8su90xI9Bzwql6rRHG2osT/WloIhY/FpO8eipidvxsCQ83JCdm/swBVUKhXL8S97E3mkdFjUpurSYMuxIr5LgcgLc1c2s1QQCAAIuTvGsMeEMhYJJqYRKCNH5cFWPCeGP6hbvJZIJdCayyWY/tc1UiQvhDXuYbJu7m7H0djTubWvQuAcvS8pta9H1JTBjq5Mm0a7HPQo7LdhEXQYPxzAo19ioCLA3uBuajg9Zpo3nUrTRnhzF5KQVYgn9dV69LahjrQKFc7ytr7no1NZy1rr+xfeSJE+Z+BdPWttqEOH7uJuzNm9ik/fu0esM0vPOZJ9Mux65tkAl25eIgBppukpQ0LdcZTXOBmagdbCpBLylpWtzQ1h0BE5SJ/rRvBn6qbcCmEqDquL/zojJ9e9jExQIm6WZ/C/eR50p27tyzJe5Fq+r5iDBjGmu/OGEeqmwlh87NV7Xq48Xxc//GcEdQ59JS/cKk6/7GOcz1ML1UqTTQYb0UmJ3Rq4n+NAksI+ZUa6DOu5Maxlo2UErdlrAUkiQxPq4SERcpGWjphyKMyFB++Sxf9ogvRQOzz/jLnpS4N4D5uDodOXlpt4XMP19hKml6S2c0+VquRawRcZHLwHxcd1tCIK04iLEEKuidxU1wP26wJuvj4TSq150eFzsvKsPFQYw9if6004NNeSQ825MS9/GMaawBLeRgoCKkG3tS4hKweDU2aT9cpxkjE5gt7GSpov0jYNYv/0gNZ6HmP+Vs44ZKpWEFMBev14u4SGOl0sCrVBrWQ4KH+iK2xMY5zALoaw615IA3Q5NSs9/PL6pJ67ezf9Rkffrq4tl+nD69efpCjR+VTFJjrwTA45p4vK4A6jQvimOOJIr9Ekw5ZVaoYzIr1FAyx8FrY/D2EyxeJx6vu8imEgokUeyUJ0XccDDotdqDx4uFOzJOQUPCHWTNB7N82Z9/khz7DsMdGdTjTznb+IlU0b6RRyfuTo/wTIapnqNVreH7SlUw/e0sYJK2SaLYW6GrkHi87vAziCPYHjZxZX/3gf8XMOSd5JsNzcQf8ivWfPtj8Rqrl1XUs3zZJ1dGBe7C0uqw8k8lk0z9vdKZcrZxk1TRvsFyv/cnYH6HIjFPpoU/zr1YX9cN4iAGmkYXn6xPv2964JAe4fnukzAQI8WwLnSXVSkmaHUGmKLWRIbyWzS6Dof7PSZYPpx8uqgmsrxKEfR/4iWbIkP59dgcKEU7LyrjyUR7JF7gngHjUcsNpvekivbNPDoxJ9bXDd5Uqof11+T8W5snuxHrNs1hfv8/xFO/GNVLLLlnLnPuNrdBzx8uclmcMO+xopSXc24unkYjTlowhZIlYJJasfZfbrQJCPbjtCIuYjN/c8wAAPgPNIOW6Oh8axIAAAAASUVORK5CYII=',
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
                            text: '\n Liste de colisage \n', 
                            fontSize: 12, 
                            bold: true 
                          },
                          { 
                            text: '\n BC - '+ el.ums.bcs.numeroCommande +'\n', 
                            fontSize: 12, 
                            bold: true 
                          },
                          { 
                            text: 'Date : ',
                            bold: true
                          },
                          formatDate(el.ums.bcs.dateCommande, 'dd-MM-yyyy', 'en') + '\n',
                          { 
                            text: 'Code UM : ',
                            bold: true
                          },
                          el.ums.bcs.destinataire.codeUM + '\n',
                          { 
                            text: 'Qté : ',
                            bold: true 
                          },
                          el.qteColis
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
                          { text: (el?.destinataire?.nom ?? '') + '\n', fontSize: 9 },
                          { text: (el?.destinataire?.adresselivraisonComplement1 ?? '') + '\n', fontSize: 9 },
                          { text: (el?.destinataire?.adresselivraisonNumero ?? '') + ' ' +  (el?.destinataire?.adresselivraisonRue ?? '') + '\n', fontSize: 9 },
                          { text: (el?.destinataire?.adresselivraisonCodepostal ?? '') + ' ' +  (el?.destinataire?.adresselivraisonLocalite ?? '') + '\n', fontSize: 9 },
                        ]
                      },
                      {
                        width: '50%',
                        margin: [10,10,0,10],
                        text: [
                          { text: 'Adresse de livraison\n', fontSize: 8, bold: true, color: '#3b96d2' },
                          { text: (el.ums?.bcs?.destinataire?.codeUM ?? '') + ' ', bold: true, fontSize: 9 },
                          { text: (el.ums?.bcs?.destinataire?.nom ?? '') + '\n', fontSize: 9 },
                          { text: (el.ums?.bcs?.destinataire?.adresselivraisonNumero ?? '') + ' ' + (el.ums?.bcs?.destinataire?.adresselivraisonRue ?? '') + '\n', fontSize: 9 },
                          { text: (el.ums?.bcs?.destinataire?.adresselivraisonCodepostal ?? '') + ' ' + (el.ums?.bcs?.destinataire?.adresselivraisonLocalite ?? '') + '\n', fontSize: 9 },
                          { text: (el.ums?.bcs?.destinataire?.telephone ?? '') + '\n', fontSize: 9 },
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
                          widths: [50, 70, 200, 70, 80, 50],
                          headerRows: 1,
                          alignment: 'center',
                          body: lignes
                        },
                        layout: {
                          hLineWidth: function (i, node) {
                            return (i < 2 || i === node.table.body.length) ? 2 : 0;
                          },
                          vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                          },
                          hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'white' : 'gray';
                          },
                          vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'white' : 'gray';
                          },
                          // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // paddingLeft: function(i, node) { return 4; },
                          // paddingRight: function(i, node) { return 4; },
                          // paddingTop: function(i, node) { return 2; },
                          // paddingBottom: function(i, node) { return 2; },
                          fillColor: function (rowIndex, node, columnIndex) { 
                            if (2 > rowIndex) {
                              return null;
                            }
                            return (rowIndex % 2 === 0) ? '#f8f8f8' : null; 
                          }
                        }
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
      pageMargins : [15, 25, 25, 16],

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

      // footer : function(currentPage, pageCount) {
      //   return [
      //     {
      //       margin: [0, 10, 0, 0],
      //       alignment : 'center',
      //       text      : currentPage.toString() + ' sur ' + pageCount,
      //       fontSize  : 8
      //     }
      //   ]
      // },
    };

    pdfMake.createPdf(docDefinition).open();         
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
                        margin: [10, 10, 0, 30],
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
                            text: '\n Stock du \n' + formatDate(new Date(), 'dd-MM-yyyy HH:mm', 'en-EN') +' \n', 
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
                [
                  {
                    fontSize: 10,
                    stack: [
                      {
                        style: 'tableExample',
                        table: {
                          widths: [60, 60, 30, 70, 190, 60, 40],
                          headerRows: 1,
                          alignment: 'center',
                          body: lignes
                        },
                        layout: {
                          hLineWidth: function (i, node) {
                            return (i < 2 || i === node.table.body.length) ? 2 : 0;
                          },
                          vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                          },
                          hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'white' : 'gray';
                          },
                          vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'white' : 'gray';
                          },
                          // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // paddingLeft: function(i, node) { return 4; },
                          // paddingRight: function(i, node) { return 4; },
                          // paddingTop: function(i, node) { return 2; },
                          // paddingBottom: function(i, node) { return 2; },
                          fillColor: function (rowIndex, node, columnIndex) { 
                            if (2 > rowIndex) {
                              return null;
                            }
                            return (rowIndex % 2 === 0) ? '#f8f8f8' : null; 
                          }
                        }
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
      pageMargins : [15, 25, 25, 20],

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

  generateVolumePDF(body: any[], action: String) {  
    let blRows: any[] = [];
    // debugger;

    let totalPalette = 0;
    let totalPoids = 0;

    let lignes = [];
    
    body.forEach(
      (el, i, arr) => {
        lignes.push(...
          [
            [
              {text:el.codeUM , margin: 5, alignment: 'center'}, 
              {text:el.destinataire , margin: 5, alignment: 'center' }, 
              {text:el.qtePalette , margin: 5, alignment: 'center'}, 
              {text:el.poids , margin: 5, alignment: 'center'}, 
            ]
          ]
        );       

        totalPalette += el.qtePalette;

        totalPoids += el.poids;
      
      }
    );

    lignes.unshift(
      [
        {text: 'Code UM', style: 'tableHeader', alignment: 'center'},
        {text: 'Destinataire', style: 'tableHeader', alignment: 'center'},
        {text: 'Quantité palette', style: 'tableHeader', alignment: 'center'}, 
        {text: 'Poids brut', style: 'tableHeader', alignment: 'center'},
      ],
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
                    margin: [10, 10, 0, 50],
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
                        text: '\n Volume et Poids\n', 
                        fontSize: 12, 
                        bold: true 
                      },
                    ],
                    fontSize  : 10,
                    alignment : 'right'
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
                      widths: [100, 235, 100, 100],
                      headerRows: 1,
                      alignment: 'center',
                      body: lignes
                    },
                    layout: {
                      hLineWidth: function (i, node) {
                        return (i < 2 || i === node.table.body.length) ? 2 : 0;
                      },
                      vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                      },
                      hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'white' : 'gray';
                      },
                      vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'white' : 'gray';
                      },
                      // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                      // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                      // paddingLeft: function(i, node) { return 4; },
                      // paddingRight: function(i, node) { return 4; },
                      // paddingTop: function(i, node) { return 2; },
                      // paddingBottom: function(i, node) { return 2; },
                      fillColor: function (rowIndex, node, columnIndex) { 
                        if (2 > rowIndex) {
                          return null;
                        }
                        return (rowIndex % 2 === 0) ? '#f8f8f8' : null; 
                      }
                    }
                  },
                ]
              }
            ],                           
            [
              {
                stack: [
                  {
                    fontSize: 15,
                    text: [
                      {
                        text: '\n', 
                        margin: 20
                      },
                    ],
                  },
                ],
                margin: [0, 20, 0, 0],
                alignment: 'justify'
              }
            ],    
            [
              {
                margin: 5,
                fontSize: 10,
                stack: [
                  {
                    absolutePosition: { x: 370, y: 700 },
                    style: 'tableExample',
                    table: {
                      widths: [100,100],
                      headerRows: 1,
                      body: [
                        [
                          {
                            text: 'Total palette', 
                            style: 'Total poids'
                          }, 
                          {
                            text: 'Total poids', 
                            style: 'tableHeader'
                          }
                        ],
                        [ totalPalette, totalPoids ],
                      ]
                    },
                    layout: {
                      hLineWidth: function (i, node) {
                        return (i < 3 || i === node.table.body.length) ? 2 : 0;
                      },
                      vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                      },
                      hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'white' : 'gray';
                      },
                      vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'white' : 'gray';
                      },
                      // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                      // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                      // paddingLeft: function(i, node) { return 4; },
                      // paddingRight: function(i, node) { return 4; },
                      // paddingTop: function(i, node) { return 2; },
                      // paddingBottom: function(i, node) { return 2; },
                      fillColor: function (rowIndex, node, columnIndex) { 
                        if (2 > rowIndex) {
                          return null;
                        }
                        return (rowIndex % 2 === 0) ? '#f8f8f8' : null; 
                      }
                    }
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
      pageMargins : [15, 25, 25, 40],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },
      info: {
        title: 'Volume et Poids',
        subject: 'volume et poids de tous bcs',
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

    if (action == 'open') {
      pdfMake.createPdf(docDefinition).open();      
    } else if (action == 'print') {
      pdfMake.createPdf(docDefinition).print();      
    } else {
      const name = 'Bcs_'+ formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf';
      pdfMake.createPdf(docDefinition).download(name);      
    }
    
  }

  generateBlPDF(body: any[], action: String) {  
    console.log(body);
    
    let blRows: any[] = [];
    // debugger;
    let totalColis = 0;

    body.forEach(
      (el, i) => {        
        totalColis = el.lignes.map(el => el.quantiteColis).reduce((p, n) => p + n);
        let lignes = [];
        lignes.push(...
          el.lignes.map(
            el => [
              {text:el.article.codeClient , margin: 5, alignment: 'left'}, 
              {text:el.article.designationClient , margin: 5, alignment: 'left'}, 
              {text:el.quantiteProduitCommande , margin: 5, alignment: 'center'}, 
              {text:el.quantiteColisCommande , margin: 5, alignment: 'center'}, 
              {text:el.quantiteProduit , margin: 5, alignment: 'center'}, 
              {text:el.quantiteColis , margin: 5, alignment: 'center'}
            ]
          )
        );       

        lignes.unshift(
          [
            {text: 'Code article', style: 'tableHeader', rowSpan : 2, alignment: 'center'},
            {text: 'Désignation', style: 'tableHeader', rowSpan : 2, alignment: 'center'},
            {text: 'Quantité commandée', style: 'tableHeader', colSpan: 2, alignment: 'center'}, 
            '', 
            {text: 'Quantité livrée', style: 'tableHeader', colSpan: 2, alignment: 'center'},
            ''
          ],
          [
            '', 
            '', 
            {text: 'Produit', style: 'tableHeader', alignment: 'center'},
            {text: 'Colis', style: 'tableHeader', alignment: 'center'}, 
            {text: 'Produit', style: 'tableHeader', alignment: 'center'}, 
            {text: 'Colis', style: 'tableHeader', alignment: 'center'}
          ],
        );

        const data = [
          {
            table : {
              headerRows: 2,
              widths: ['*'],
              body: [
                [
                  {
                    columns : [
                      {
                        margin: [10, 10, 0, 0],
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
                            text: '\n'+ el.bls.numeroBonLivraison +'\n', 
                            fontSize: 12, 
                            bold: true 
                          },
                          { 
                            text: 'Date :' 
                          },
                          formatDate(el.bcs.dateCommande, 'dd-MM-yyyy', 'en')
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
                          { text: 'GROUPE ETHIQUE ET SANTE \n', fontSize: 9 },
                          { text: 'ACTIBURO 1 - BÂTIMENT A \n', fontSize: 9 },
                          { text: '100 CHEMIN DE L\'AUMÔNE VIEILLE \n', fontSize: 9 },
                          { text: '13400 AUBAGNE \n', fontSize: 9 },
                        ]
                      },
                      {
                        width: '50%',
                        margin: [10,10,0,10],
                        text: [
                          { text: 'Adresse de livraison\n', fontSize: 8, bold: true, color: '#3b96d2' },
                          { text: (el.bcs?.destinataire?.codeUM ?? '') + '  ', bold: true, fontSize: 9 },
                          { text: (el.bcs?.destinataire?.nom ?? '') + '\n', fontSize: 9 },
                          { text: (el.bcs?.destinataire?.adresselivraisonNumero ?? '') + ' ' + (el.bcs?.destinataire?.adresselivraisonRue ?? '') + '\n', fontSize: 9 },
                          { text: (el.bcs?.destinataire?.adresselivraisonCodepostal ?? '') + ' ' + (el.bcs?.destinataire?.adresselivraisonLocalite ?? '') + '\n', fontSize: 9 },
                          { text: (el.bcs?.destinataire?.telephone ?? '') + '\n', fontSize: 9 },
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
                          widths: [80, 230, 50, 50, 50, 50],
                          headerRows: 2,
                          alignment: 'center',
                          body: lignes
                        },
                        layout: {
                          hLineWidth: function (i, node) {
                            return (i < 3 || i === node.table.body.length) ? 2 : 0;
                          },
                          vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                          },
                          hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'white' : 'gray';
                          },
                          vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'white' : 'gray';
                          },
                          // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                          // paddingLeft: function(i, node) { return 4; },
                          // paddingRight: function(i, node) { return 4; },
                          // paddingTop: function(i, node) { return 2; },
                          // paddingBottom: function(i, node) { return 2; },
                          fillColor: function (rowIndex, node, columnIndex) { 
                            if (2 > rowIndex) {
                              return null;
                            }
                            return (rowIndex % 2 === 0) ? '#f8f8f8' : null; 
                          }
                        }
                      },
                    ]
                  }
                ],  
                [
                  {
                    margin: 5,
                    fontSize: 10,
                    stack: [
                      {
                        absolutePosition: { x: 370, y: 700 },
                        style: 'tableExample',
                        table: {
                          widths: [100,100],
                          headerRows: 1,
                          body: [
                            [
                              {
                                border: [false, false, false, true],
                                text: 'Nombre de colis : ', 
                              }, 
                              {
                                border: [false, false, false, true],
                                text: totalColis, 
                                alignment: 'right',
                                style: 'tableHeader'
                              }
                            ],
                          ]
                        },
                      },
                    ]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: function(i, node) { return (i === 1 || i === 2) ? 1 : 0; },
              vLineWidth: function(i, node) { return 0; },
              hLineColor: function(i, node) { return 'white'; },
              vLineColor: function(i, node) { return 'white' },
              paddingBottom: function(i, node) {                
                switch (i) {
                  case 0:
                    return 5;
                  case 1:
                    return 10;
                  default:
                    return 0;
                }
              },
              paddingTop: function(i, node) {
                switch (i) {
                  case 0:
                    return 0;
                  case 1:
                    return 8;
                  default:
                    return 10;
                }
              }
            }
          },
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
      pageMargins : [15, 25, 25, 35],

      defaultStyle : {
        lineHeight: 1.2,
        fontSize  : 12,
        columnGap : 20
      },
      info: {
        title: 'Liste bons de livraison',
        Subject: 'bls',
        author: 'Crossdock',
        keywords: 'cdk, crossdock',
      },

      content : blRows,

      // footer : function(currentPage, pageCount) {
      //   return [
      //     {
      //       alignment : 'center',
      //       text      : currentPage.toString() + ' sur ' + pageCount,
      //       fontSize  : 8
      //     }
      //   ]
      // },
    };

    if (action == 'open') {
      pdfMake.createPdf(docDefinition).open();      
    } else if (action == 'print') {
      pdfMake.createPdf(docDefinition).print();      
    } else {
      const name = 'Bls_'+ formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf';
      pdfMake.createPdf(docDefinition).download(name);      
    }
    
  }

  //#endregion

  //#region search

  filterByDateCommande() {
    let date : string | number = '';
    
    if (this.dateCommandeFilter) {
      let day = this.dateCommandeFilter['day'];
      let month = this.dateCommandeFilter['month'];
      let year = this.dateCommandeFilter['year'];

      date = new Date(year, month - 1, day).getTime();
    }
    
    return date;
  }

  filterRows(NumeroBcsFilter, DateCommandeFilter, CodeUMFilter): any[] {       
    return this.tempData.filter(row => {                 
      const isPartialCodeUMMatch = (row.destinataire?.codeUM + '').indexOf(CodeUMFilter) !== -1  || CodeUMFilter === '';
      const isPartialDateCommandeMatch = (row.dateCommande == DateCommandeFilter) || DateCommandeFilter === '';
      const isPartialNumeroBcsMatch = (row.numeroCommande + '').indexOf(NumeroBcsFilter) !== -1 || NumeroBcsFilter === '';

      return isPartialCodeUMMatch && isPartialDateCommandeMatch && isPartialNumeroBcsMatch;
    });
  }

  search() {
    this.temp = this.filterRows(this.numeroBcsFilter, this.filterByDateCommande(), this.codeUmFilter);
    this.bcsList = this.temp;
  }

  clear() {
    this.dateCommandeFilter = '';
    this.numeroBcsFilter = '';
    this.codeUmFilter = '';
    this.search();
  }

  //#endregion

  //#region hooks
  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Résultat de repartition',
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
            name: 'Script',
            isLink: true,
            link: '/repartition/script'
          },
          {
            name: 'liste bcs',
            isLink: false
          }
        ]
      }
    };

    this._coreConfigService.getConfig().subscribe(
      config => {
        if (config.layout.menu.collapsed === true || config.layout.menu.collapsed === false) {
          setTimeout(
            () => {
              this.isMenuToggled = true;
              this.apexRadialChart.chart.width = this.apexRadialChartRef?.nativeElement.offsetWidth;
            }, 
            900
          );
        }
      }
    );

    this._scriptDashboardService.volume(this._scriptHistoryService.ts).subscribe(
      response => {   
        let r = response;        
        r.forEach(
          (el, i) => {
            this.volumes.push(
              {
                codeUM: el['codeUM'],
                destinataire: el['destinataire'],
                qtePalette: el['qtePalette'],
                poids: el['poids']
              }
            );
          }
        );
      }
    );

    this._scriptHistoryService.onHistoryChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {       
        this.bcsList = response.bcsList;
        this.tempData = response.bcsList;
      }
    ); 
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  //#endregion
}
