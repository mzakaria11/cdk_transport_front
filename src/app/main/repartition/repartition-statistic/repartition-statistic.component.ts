import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { colors } from 'app/colors.const';
import { CoreConfigService } from '@core/services/config.service';
import { RepartitionStatisticService } from './repartition-statistic.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StatisticRep } from '../repartition.model';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-repartition-statistic',
  templateUrl: './repartition-statistic.component.html',
  styleUrls: ['./repartition-statistic.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepartitionStatisticComponent implements OnInit, AfterViewInit {

  //#region Variables

  public hasRole: String[] = [];
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

  @ViewChild('colisChartRef') colisChartRef: any;

  // Public
  public data: any;

  public statResponse: boolean = false;
  public yearlyStatResponse: boolean = false;
  public rupturStatResponse: boolean = false;

  public repStat: any;
  public articleTableStat: any;
  public articlRuptureStat: any;

  public yearlyColisLivre: any[] = [];
  public yearlyColisNonLivre: any[] = [];

  public cmdList: any[] = [];
  public selectedOption = 25;
  public ColumnMode = ColumnMode;

  public colisChartoptions;
  public isMenuToggled = false;

  // Private
  private $textMutedColor = '#b9b9c3';

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _destinataireListService: DestinataireListService,
    private _articleListService: ArticleListService,
    private _coreConfigService: CoreConfigService,
    private _repStatService: RepartitionStatisticService
  ) {

    this._unsubscribeAll = new Subject();

    this.colisChartoptions = {
      chart: {
        height: 230,
        stacked: true,
        type: 'bar',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          columnWidth: '17%',
          endingShape: 'rounded'
        }
      },
      colors: [colors.solid.success, colors.solid.danger],
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
        position: "top"
      },
      grid: {
        yaxis: {
          lines: { show: true }
        }
      },
      xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        labels: {
          style: {
            colors: this.$textMutedColor,
            fontSize: '0.86rem'
          }
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: this.$textMutedColor,
            fontSize: '0.86rem'
          },
          formatter: function(y) {
            return y.toFixed(0) + " Colis";
          }
        }
      }
    };
  }

  clear() {
    this.selectedDestinataire = null;
    this.selectedArticle = null;
    this.dateStart = null;
    this.dateEnd = null;
    this.dateStartExp = null;
    this.dateEndExp = null;

    this._repStatService.getRepartitionStat();
    this._repStatService.getRepartitionStat();  
    this._repStatService.getRepartitionStatByYear();  
    this._repStatService.getRepartitionStatByArticle();  
    this._repStatService.getRepartitionStatByArticleRupture();  
  }

  search() {   
    if (this.cmd) {
      this._repStatService.getCmdData(this.cmd)
      .subscribe(
        (response) => {
          this.cmdList = response;
        }
      );

      return;
    }

    this.statResponse = false;
    this.yearlyStatResponse = false;
    this.rupturStatResponse = false;

    this.repStat= null;
    this.articleTableStat= null;
    this.articlRuptureStat= null;
  
    this.yearlyColisLivre = [];
    this.yearlyColisNonLivre = [];

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

    if (filter) {      
      this._repStatService.getRepartitionStat(filter)  
      this._repStatService.getRepartitionStatByYear(filter);  
      this._repStatService.getRepartitionStatByArticle(filter);  
      this._repStatService.getRepartitionStatByArticleRupture(filter);  
    }
  }

  generateMonthlyData(data, field) {
    const result = new Array(12).fill(0);

    data.forEach(item => {     
        result[item.month - 1] += item[field];
    });

    return result;
  }

  //#region HOOKS

  ngOnInit(): void {
    this._destinataireListService.getDestinataire().subscribe(
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

    this._repStatService.onRepStatChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        try {                  
          this.repStat = response;  
          this.statResponse = true;               
        } catch (error) {
          this.statResponse = false;
          console.error('Error while processing the rep stat response:', error);
        }
      },
      error => {
        this.statResponse = false;
        console.error('Error while processing the rep stat response:', error);
      }
    ); 

    this._repStatService.onRepStatYearChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        try {                           
          this.yearlyColisLivre = this.generateMonthlyData(response, 'colisLivreByYear');
          this.yearlyColisNonLivre = this.generateMonthlyData(response, 'colisNonLivreByYear');

          this.yearlyStatResponse = true;
        } catch (error) {
          console.error('Error while processing the rep stat response:', error);
        }
      },
      error => {
        this.yearlyStatResponse = false;
        console.error('Error while processing the rep stat response:', error);
      }
    ); 

    this._repStatService.onRepStatArticleChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        try {                  
          this.articleTableStat = response;
        } catch (error) {
          console.error('Error while processing the rep stat response:', error);
        }
      },
      error => {
        console.error('Error while processing the rep stat response:', error);
      }
    ); 

    this._repStatService.onReparticleRuptureChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        try {                  
          this.articlRuptureStat = response;
          this.rupturStatResponse = true;
        } catch (error) {
          this.rupturStatResponse = false;
          console.error('Error while processing the rep stat response:', error);
        }
      },
      error => {
        this.rupturStatResponse = false;
        console.error('Error while processing the rep stat response:', error);
      }
    ); 
    
    this.contentHeader = {
      headerTitle: 'Liste',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Répartition',
            isLink: true,
            link: '/'
          },
          {
            name: 'Statistique',
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

  ngAfterViewInit() {
    this._coreConfigService.getConfig().subscribe(config => {
      if (
        (config.layout.menu.collapsed === true || config.layout.menu.collapsed === false) &&
        localStorage.getItem('currentUser')
      ) {
        setTimeout(() => {
          this.isMenuToggled = true;
          this.colisChartoptions.chart.width = this.colisChartRef?.nativeElement.offsetWidth;
        }, 500);
      }
    });
  }

  //#endregion
}