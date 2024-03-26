import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';
import { colors } from 'app/colors.const';

@Component({
  selector: 'app-colis-chart',
  templateUrl: './colis-chart.component.html',
  styleUrls: ['./colis-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ColisChartComponent implements OnInit, AfterViewInit {

  @Input() data;

  public livre: any[] = [];
  public nonLivre: any[] = [];

  @ViewChild('colisChartRef') colisChartRef: any;
  public colisChartoptions;

  public isMenuToggled = false;
  private $textMutedColor = '#b9b9c3';

  constructor (
    private _coreConfigService: CoreConfigService
  ) {
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
          formatter: function (y) {
            return y.toFixed(0) + " Colis";
          }
        }
      }
    };
  }

  generateMonthlyData(data, field) {
    const result = new Array(12).fill(0);

    data.forEach(
      item => {
        result[item.month - 1] += item[field];
      }
    );

    return result;
  }

  ngOnInit(): void {
    this.livre = this.generateMonthlyData(this.data, 'colisLivreByYear');
    this.nonLivre = this.generateMonthlyData(this.data, 'colisNonLivreByYear');
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
}
