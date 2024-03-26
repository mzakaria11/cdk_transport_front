import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { BCS } from 'app/main/bonCommand/sortie/bcs.model';
import { BoncommandsortieDetailService } from 'app/main/bonCommand/sortie/boncommandsortie-detail/boncommandsortie-detail.service';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BLS } from '../bls.model';
import { BonlivraisonsortieDetailService } from './bonlivraisonsortie-detail.service';
import { NgbDateStruct, NgbDatepickerI18n, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import Swal from 'sweetalert2';
import { DocumentService } from 'app/main/documents/document.service';
import { ScriptHistoryService } from 'app/main/script/script-history/script-history.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-bonlivraisonsortie-detail',
  templateUrl: './bonlivraisonsortie-detail.component.html',
  styleUrls: ['./bonlivraisonsortie-detail.component.scss'],
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
  encapsulation: ViewEncapsulation.None
})
export class BonlivraisonsortieDetailComponent implements OnInit {

  //#region Variables

  private _unsubscribeAll: Subject<any>;

  public contentHeader: Object;
  
  public rows;
  public rowsUms;
  public ColumnMode = ColumnMode;
  public selectedOption = 25;
  public selectedOptionUms = 10;

  public dateBlOptions: FlatpickrOptions = {
    altInput: true,
  };
  
  public edit: boolean;
  public data: BLS;
  public bcs: BCS;
  
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public coreConfig: any;
  public dateBl: NgbDateStruct;

  //#endregion
  
  constructor(
    private _blsDetailService: BonlivraisonsortieDetailService,
    private _bcsDetailService: BoncommandsortieDetailService,
    private _coreConfigService: CoreConfigService,
    private _documentService: DocumentService,
    private _scriptHistoryService: ScriptHistoryService,
    private calendar: NgbCalendar
  ) { 
    this.dateBl = calendar.getToday();
    this.edit = _blsDetailService.editable;
    this._unsubscribeAll = new Subject();
    this.bcs = new BCS();
  }

  pdf() {
    this._documentService.generateBlsPdf('blsBcs', [this.bcs.id])
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

  //#region HOOKS

  ngOnInit(): void {
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this._blsDetailService.onBLSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.data = response;
        this.rows = this.data.lignes;
        this.rowsUms = this.data.umsList;

        this.dateBl = {
          day: new Date(this.data.dateImpression).getDate(),
          month: new Date(this.data.dateImpression).getUTCMonth() + 1,
          year: new Date(this.data.dateImpression).getUTCFullYear()
        };
      }
    );
    
    this._bcsDetailService.getApiData(this.data.bcs.id).then(
      res => {
        this.bcs = res;
      }
    );

    this.contentHeader = {
      headerTitle: 'Détail',
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
            name: 'Bls',
            isLink: true,
            link: '/bls/list'
          },
          {
            name: this.data.numeroBonLivraison,
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
