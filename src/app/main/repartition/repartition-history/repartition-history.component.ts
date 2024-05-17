import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'app/auth/service';
import { RepartitionRequest } from '../repartition.model';
import { RepartitionHistoryService } from './repartition-history.service';
import {TarifTotalCalculeService } from "../../tarif-total/tarif-total-calcule/tarif-total-calcule.service";
import {ActivatedRoute, Router} from "@angular/router";
import {APiResponse} from "../../../api-response";


class APiResponses{

  content: any[];
  // Add other fields if necessary

}
@Component({
  selector: 'app-repartition-history',
  templateUrl: './repartition-history.component.html',
  styleUrls: ['./repartition-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepartitionHistoryComponent implements OnInit {

  //#region var

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

  public repartitionHistrories: any[];
  public repInProcess: any[];
  public temp: any[];
  public request: RepartitionRequest;
  
  public searchValue = '';
  public isExecut = false;
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _repartitonHistoryService: RepartitionHistoryService,
    private _authenticationService: AuthenticationService,
    private tariffService: TarifTotalCalculeService, private router: Router,
    private route: ActivatedRoute
  ) {
    this.request = new RepartitionRequest();
    console.log(this.request);
    
    this._unsubscribeAll = new Subject();
  }

  //#region Load Data

  onSizeChange(size) {           
    this.request.page.size = parseInt(size);
    this.request.page.limit = parseInt(size);
    console.log(size);
    
    this.pageCallback({ offset: 0, pageSize: size, limit: size})
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {            
    this.request.page.offset = pageInfo.offset;
    console.log(this.request);
    
    this.reloadTable();
  }



  async reloadTable() {
    try {
      // Fetch the repartition history data
      const response: any = await this._repartitonHistoryService.getRepartitionHistoryDataRows(this.request);
      this.request.page.count = response.content.length;
      this.request.page.limit = this.request.page.size;
      this.repartitionHistrories = response.content as any[];
      this.temp = this.repartitionHistrories;

      // Fetch the grouped confirmed data
      const groupedConfirmedData: any = await this._repartitonHistoryService.getGroupedConfirmedData();
      console.log('Grouped Confirmed Data:', groupedConfirmedData);

      // Map the grouped confirmed data to a format easy to lookup
      const expeditionStatusMap = new Map(groupedConfirmedData.map((item: any) => [item.chorodatage, item.hasUnconfirmedExpedition]));
      console.log('Expedition Status Map:', expeditionStatusMap);

      // Add hasUnconfirmedExpedition to each history item based on matching date
      this.repartitionHistrories.forEach(history => {
        const hasUnconfirmedExpedition = expeditionStatusMap.get(history.dateC) ? 1 : 0;
        console.log("Matched Status:", expeditionStatusMap.get(history.dateC));
        console.log('History Date:', history.dateC, 'Has Unconfirmed Expedition:', hasUnconfirmedExpedition);
        history.hasUnconfirmedExpedition = hasUnconfirmedExpedition;
        console.log('Updated History:', history);
      });

      // This ensures Angular change detection picks up the updates
      this.repartitionHistrories = [...this.repartitionHistrories];

      console.log('Final Repartition Histories:', this.repartitionHistrories);
    } catch (error) {
      console.error('Error loading data', error);
    }
  }






  //#endregion

  //#region Hooks

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);


    this.reloadTable();
    
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
            name: 'Historique des répartitions',
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

  //#endregion

}