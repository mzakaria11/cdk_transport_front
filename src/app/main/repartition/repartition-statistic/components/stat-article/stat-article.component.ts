import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { StatArticleService } from './stat-article.service';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-stat-article',
  templateUrl: './stat-article.component.html',
  styleUrls: ['./stat-article.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatArticleComponent implements OnInit {

  @Input() dropDown: any[];
  public selectedArticle;
  public cmd;

  public articles: any[] = [];
  public temp: any[] = [];
  public selectedOption = 10;
  public ColumnMode = ColumnMode;

  constructor (
    private _articleListService: ArticleListService,
    private _statArticleService: StatArticleService,
  ) { }

  exportToExcel(): void {
    const data = this.formatData();
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const date = formatDate(new Date(), 'dd-MM-yyyy', "en");
    const fileName = this.cmd ? `Statistique_CMD_${this.cmd}` : this.selectedArticle ? `Statistique_Article_${this.articles.find(e => e.id = this.selectedArticle).codeClient}` : "Statistique_stock";

    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }

  formatData(): any[] {
    if (this.cmd || this.selectedArticle) {
      return this.articles.map(
        i => (
          {
            "Article": `${i.codeClient} | ${i.designationClient}`,
            "Stock": 
              `Actual : ${i.quantiteColisStockComplet + i.quantiteColisStockIncomplet} colis (${i.quantiteProduitStockComplet + i.quantiteProduitStockIncomplet} U)\r\n` +
              `Avant répartition : ${i.stockBeforeRep} colis (${i.uniteBeforeRep} U)`,
            "Qté commandée en cours": `${ i.quantiteUniteManutentionSortie } colis (${ i.qteProduitLivre } U)`,
            "Code Um": i.codeUM,
            "N° Commande": i.numeroCommande
          }
        )
      );
    }

    return this.articles.map(
      i => (
        {
          "Article": `${i.codeClient} | ${i.designationClient}`,
          "Stock avant répartition": `${i.stockBeforeRep} colis (${i.uniteBeforeRep} U)`,
          "Qté commandée en cours": `${i.quantiteUniteManutentionSortie} colis (${i.qteProduitLivre} U)`,
          "Stock":`${i.quantiteColisStockComplet + i.quantiteColisStockIncomplet} colis (${i.quantiteProduitStockComplet + i.quantiteProduitStockIncomplet} U)`
        }
      )
    );
  }

  search() {
    this.articles = [];

    if (!this.selectedArticle && !this.cmd) {
      this.articles = this.temp;
    } else {
      this._statArticleService.fetchData(this.cmd, this.selectedArticle)
        .subscribe(
          (response: any[]) => {
            this.articles = response;
          },
          (error) => {
            console.error("Search with params failed : ", error);
          }
        )
    }
  }

  ngOnInit(): void {
    this._statArticleService.fetchData()
      .subscribe(
        (response: any[]) => {
          this.articles = response;
          this.temp = this.articles;
        },
        (error) => {
          console.error("Search with params failed : ", error);
        }
      )
  }
}
