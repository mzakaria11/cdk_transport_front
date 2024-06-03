import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'app/auth/service';
import { RepartitionRequest } from '../repartition.model';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { RepartitionDetailService } from './repartition-detail.service';
import { formatDate } from '@angular/common';
import { colors } from 'app/colors.const';
import { CoreConfigService } from '@core/services/config.service';
import { DocumentService } from 'app/main/documents/document.service';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from "@angular/router";
import {TarifTotalCalculeService} from "../../tarif-total/tarif-total-calcule/tarif-total-calcule.service";
import {environment} from "../../../../environments/environment";
import {data} from "autoprefixer";

@Component({
  selector: 'app-repartition-detail',
  templateUrl: './repartition-detail.component.html',
  styleUrls: ['./repartition-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepartitionDetailComponent implements OnInit {


  //#region  Var

  @ViewChild('goalChartRef') goalChartRef: any;

  public goalChartoptions;
  public isMenuToggled = false;
    isItTermine: boolean = true;

  // Private
  private $goalStrokeColor2 = '#51e5a8';
  private $textHeadingColor = '#5e5873';
  private $strokeColor = '#ebe9f1';
  
  public hasRole: String[] = [];
  public contentHeader: Object;

  public currentPageLimit: number = 25;
  public currentPageLimitRep: number = 25;
  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
    { value: 500 },
  ];

  public repartition: any[];
  public articleOutStock: any[];
  public articleInsStock: any[];
  public umsStat: any;
  public UmsPercent: any;
  public temp: any[];
  public request: RepartitionRequest;
  
  public searchValue = '';
  public isExecut = false;

  public dateExpedition: string;
  public currDate: string;
  public qrCode: any;

  public articleTableStat: any;

  public articles: any[] = [];
  public destinataires: any[] = [];
  public SelectedArticle: any;
  public selectedDestinataire: any;

  public articlesByRep: any[];
  
  public selectedOption = 25;
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  public loading: boolean = false;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private cdRef: ChangeDetectorRef,
    private _repartitonDetailService: RepartitionDetailService,
    private _authenticationService: AuthenticationService,
    private _coreConfigService: CoreConfigService,
    private _documentService: DocumentService,
    private modalService: NgbModal,
    private _router: Router,
    private tariffService: TarifTotalCalculeService, private router: Router,
    private route: ActivatedRoute
) {
    this.currDate = formatDate(new Date(), "yyyy-MM-dd", "en");

    this.request = new RepartitionRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();

    this.goalChartoptions = {
      chart: {
        height: 245,
        type: 'radialBar',
        sparkline: {
          enabled: true
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          left: 1,
          top: 1,
          opacity: 0.1
        }
      },
      colors: [this.$goalStrokeColor2],
      plotOptions: {
        radialBar: {
          offsetY: -10,
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: '77%'
          },
          track: {
            background: this.$strokeColor,
            strokeWidth: '50%'
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              color: this.$textHeadingColor,
              fontSize: '2.86rem',
              fontWeight: '600'
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: [colors.solid.success],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      stroke: {
        lineCap: 'round'
      },
      grid: {
        padding: {
          bottom: 30
        }
      }
    }; 
  }





  //#region Documents
genererTransporteur() {

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
            confirmButtonText: 'Oui, généré-le!',
            cancelButtonText: 'Non, annulez!',
            reverseButtons: true
        }
    )
        .then(
            (result) => {
                if (result.isConfirmed) {

                    this.toTransport()

                }
                else if ( result.dismiss === Swal.DismissReason.cancel )
                {
                    swalWithBootstrapButtons.fire(
                        'Annulé',
                        'Rien n\'a changé',
                        'error'
                    );
                }
            }
        );

}

  genererBl(): void {
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
        confirmButtonText: 'Oui, généré-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    )
    .then(
      (result) => {       
        if (result.isConfirmed) {  
      
          let dateExp = new Date(this.dateExpedition).getTime() / 1000;

          // console.log(dateExp);
          
          this._repartitonDetailService.genererBl(dateExp).subscribe(
            response => {
              this.dateExpedition = null;
              this.modalService.dismissAll();

              let icon: any = response.length == 0 ? 'info' : 'success';
              let html: any = `${response.length} BLS ont été générés` + (response.length == 0 ? '' : ' avec succès');

              Swal.fire(
                {
                  position: 'top-end',
                  icon: icon,
                  title: 'Génération!',
                  html: html,
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._repartitonDetailService.getRepartitionDataRows();
                }
              );
            }
          );

        } 
        else if ( result.dismiss === Swal.DismissReason.cancel ) 
        {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'Rien n\'a changé',
            'error'
          );
        }
      }
    );


  }

  pdf(type: string) {
    this._documentService.generatePdf(type, this._repartitonDetailService.ts)
    .subscribe(
      (blobData: Blob) => this._documentService.openFile(blobData),
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
  }

  pdfById(type: string, id: number) {
    this._documentService.generatePdfById(type, id)
    .subscribe(
      (blobData: Blob) => this._documentService.openFile(blobData),
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
  }

  blsByBcs(id: number) {
    this._documentService.generateBlsPdf('blsBcs', [id])
    .subscribe(
      (response: HttpResponse<Blob>) => {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        window.open(url, '_blank');
      },
      () => {
        Swal.fire(
          {
            text: "Aucun document n'a été généré !",
            icon: 'warning',
            confirmButtonText: 'OK'
          }
        );
      }
    );
  }

  volume() {
    this._documentService.generateVolumeExcel (this._repartitonDetailService.ts)
    .subscribe(
      (blobData: Blob) => this._documentService.saveFile(blobData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "volumes et poids.xlsx"),
      () => {
        Swal.fire(
          {
            text: "Aucun fichier n'a été généré !",
            icon: 'warning',
            confirmButtonText: 'OK'
          }
        ) 
      }
    );
  }

  sendMail() {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "En confirmant, un email sera envoyé à tous les clients qui ont commandé au moins un aritcle en rupture de stock !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'non',
      confirmButtonText: 'Oui, envoyez-le!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._repartitonDetailService.sendEmails()
        .subscribe(
          () => {
            Swal.fire(
              'Envoyés!',
              'Les emails ont été envoyés !',
              'success'
            );
          }
        )
      }
    })
  }

  //#endregion

  //#region Helpers

  modalConfirm(modal): void {
    this.modalService.open(modal, {
      centered: true
    });
  }

  search() {
    this._repartitonDetailService.getStatArticleDataRows( { article: this.SelectedArticle ??  null, destinataire: this.selectedDestinataire ?? null } ).then(
      () => {
        this.cdRef.detectChanges();
      }  
    );  
  }

  //#endregion

  //#region Load Data

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return (d.numeroCommande + '').toLowerCase().indexOf(val) !== -1 
      || (d.destinataire.codeUM + '').toLowerCase().indexOf(val) !== -1 
      || (d.destinataire.nom + '').toLowerCase().indexOf(val) !== -1 
      || !val;
    });

    this.repartition = temp;
    this.table.offset = 0;
  }

  onSizeChange(size) {           
    this.request.page.size = size;
    this.request.page.limit = size;
    this.pageCallback({ offset: 0, pageSize: size, limit: size})
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {            
    this.request.page.offset = pageInfo.offset;
    this.reloadTable();
  }

  reloadTable() {
    this._repartitonDetailService.getRepartitionDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;
        
        this.repartition = response.data as any[];
        console.log(this.repartition)
        this.temp = this.repartition;
      }
    );
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;

    this.request.dir = col.includes("destinataire.codeUM") ? dir : undefined;
    this.request.sort = !this.request.dir ? `&sort=${col},${dir}` : '';    

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

    unixDate: number ; // example Unix date
    rows = [];
    id: string;

    toTransport() {
        this.router.navigate([`/ctt/list/${this.id}`]); // Navigate to display page
    }
  //#endregion

  //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // #region Hooks


    isItTrue : boolean;
    issItTerminee(){


        this._repartitonDetailService.isItTermine(this.unixDate).subscribe(
            data => this.isItTrue= data
        )

    }

  ngOnInit(): void {

    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
      this.route.paramMap.subscribe(params => {
          this.id = params.get('id');
          this.unixDate = +this.id;// Use paramMap for safer access to parameters
          console.log('Retrieved ID:dddddddddddddddddddddddddddddddddddddddddddddddd', this.unixDate);
      });
      this.issItTerminee();

      console.log('Retrieved ID:ddddddddddddddd', this.unixDate);
    this._repartitonDetailService.onRepartitionChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;
        
        this.repartition = response.data as any[];
        console.log(this.repartition);
        this.temp = this.repartition;
          for (const obj of this.repartition) {
              if (obj['termine'] == false) {
                  // If 'termine' property is false in any object, set the boolean variable to true
                  console.log("hhhhhhhh" + obj['termine'])
                  this.isItTermine = false;
                  // Break out of the loop if you only want to know if there's at least one false 'termine' property
                  break;
              }
          }

// Output the result
          console.log("isItTermine:", this.isItTermine);
      }
    ); 

    this._repartitonDetailService.onOutOfStockChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {       
        this.articleOutStock = response;        
      }
    ); 
   
    this._repartitonDetailService.onInsStockChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: any) => {
        this.articleInsStock = response;        
      }
    ); 
   
    this._repartitonDetailService.onCountChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe( 
      (response: any) => {
        this.umsStat = response;        
        this.UmsPercent = this.umsStat.countUms > 0 ? parseInt(((this.umsStat.umsFermee / this.umsStat.countUms) * 100).toFixed(2)) : 0;
      }
    ); 
   
    this._repartitonDetailService.onArticleByRepChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe( 
      (response: any) => {       
        if (this.articles.length == 0) {     
          response.articles.forEach(
            (el) => {
              const name = el['codeClient'] + ' | ' + el['designationClient'];
              const id = el.id;          
              this.articles = [...this.articles, { name, id }];
            }
          ); 
        }
        
        if (this.destinataires.length == 0) {          
          response.destinataires.forEach(
            (el) => {
              const name = el['codeUM'] + ' | ' + el['nom'];
              const id = el.id;          
              this.destinataires = [...this.destinataires, { name, id }];
            }
          ); 
        }
        
        this.articlesByRep = response.repArticleStatDTOS;        
      }
    ); 

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
            name: 'Répartition',
            isLink: true,
            link: '/repartition/list'
          },
          {
            name: formatDate(new Date(this._repartitonDetailService.ts * 1000), 'dd-MM-yyyy', 'en'),
            isLink: false
          }
        ]
      }
    }; 
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }

  ngAfterViewInit() {
    this._coreConfigService.getConfig().subscribe(config => {
      if (
        (config.layout.menu.collapsed === true || config.layout.menu.collapsed === false) &&
        localStorage.getItem('currentUser')
      ) {
        setTimeout(() => {
          this.isMenuToggled = true;
          this.goalChartoptions.chart.width = this.goalChartRef?.nativeElement.offsetWidth;
        }, 500);
      }
    });
  }

  //#endregion

}