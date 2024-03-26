import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { StatisticRep } from '../../repartition.model';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { RepartitionStatisticService } from '../repartition-statistic.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {
  public contentHeader: Object;

  public destinataires: any[];
  public articles: any[] = [];
  public cmd: string;
  public selectedDestinataire: number;
  public selectedArticle: number;
  public dateStart: string;
  public dateEnd: string;
  public dateStartExp: string;
  public dateEndExp: string;

  public colisChartoptions;

  public gridStats: any[];
  public gridStatsResponse: boolean = false;

  public yearlyStat: any;
  public yearlyStatsResponse: boolean = false;

  public ruptureStat: any[];
  public ruptureStatsResponse: boolean = false;

  public showArticles: boolean = false;

  private _unsubscribeAll: Subject<any>;

  constructor (
    private _destinataireListService: DestinataireListService,
    private _articleListService: ArticleListService,
    private _repStatService: RepartitionStatisticService
  ) {
    this._unsubscribeAll = new Subject();
  }

  clear() {
    this.cmd = null;
    this.selectedDestinataire = null;
    this.selectedArticle = null;
    this.dateStart = null;
    this.dateEnd = null;
    this.dateStartExp = null;
    this.dateEndExp = null;

    this.gridStatsResponse = false;
    this.yearlyStatsResponse = false;
    this.ruptureStatsResponse = false;
  }

  search() {
    let filter: StatisticRep = new StatisticRep();

    if (this.dateStart) {
      filter.dateStart = new Date(this.dateStart).getTime();
    }

    if (this.dateEnd) {
      filter.dateEnd = new Date(this.dateEnd).getTime();
    }

    if (this.dateStartExp) {
      filter.dateStartExp = new Date(this.dateStartExp).getTime();
    }

    if (this.dateEndExp) {
      filter.dateEndExp = new Date(this.dateEndExp).getTime();
    }

    if (this.selectedArticle) {
      filter.idArticle = this.selectedArticle;
    }

    if (this.selectedDestinataire) {
      filter.idDestinataire = this.selectedDestinataire;
    }

    this.loadRepStats(filter);
    this.loadYearlyStats(filter);
    this.loadRepturesStats(filter);
  }

  loadRepStats(filter) {
    this._repStatService.getRepartitionStat(filter)
      .then(
        (response: any) => {
          try {
            this.gridStats = response;
            this.gridStatsResponse = true;
          } catch (error) {
            this.gridStatsResponse = false;
            console.error('Error while processing the rep stat response:', error);
          }
        },
        error => {
          this.gridStatsResponse = false;
          console.error('Error while processing the rep stat response:', error);
        }
      );
  }

  loadYearlyStats(filter) {
    this._repStatService.getRepartitionStatByYear(filter)
      .then(
        (response: any) => {
          try {
            this.yearlyStat = response;
            this.yearlyStatsResponse = true;
          } catch (error) {
            this.yearlyStatsResponse = false;
            console.error('Error while processing the rep stat response:', error);
          }
        },
        error => {
          this.yearlyStatsResponse = false;
          console.error('Error while processing the rep stat response:', error);
        }
      );
  }

  loadRepturesStats(filter) {
    this._repStatService.getRepartitionStatByArticleRupture(filter)
      .then(
        (response: any) => {          
          try {
            this.ruptureStat = response;
            this.ruptureStatsResponse = true;
          } catch (error) {
            this.ruptureStatsResponse = false;
            console.error('Error while processing the rep stat response:', error);
          }
        },
        error => {
          this.ruptureStatsResponse = false;
          console.error('Error while processing the rep stat response:', error);
        }
      );
  }

  ngOnInit(): void {
    this._destinataireListService.getDestinataire()
      .subscribe(
        response => {
          this.destinataires = response['data'];
        }
      );

    this._articleListService.getAllArticlesDataRows()
      .then(
        (response) => {
          try {
            response.forEach(
              (el) => {
                const name = el.codeClient + ' | ' + el.designationClient;
                const id = el.id;
                this.articles = [...this.articles, { name, id }];
              }
            );
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
