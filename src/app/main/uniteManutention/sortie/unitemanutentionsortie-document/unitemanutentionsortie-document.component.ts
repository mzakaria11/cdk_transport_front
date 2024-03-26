import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';
import { BCS } from 'app/main/bonCommand/sortie/bcs.model';
import { BoncommandsortieDetailService } from 'app/main/bonCommand/sortie/boncommandsortie-detail/boncommandsortie-detail.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UMS } from '../ums.model';
import { UnitemanutentionsortieDocumentService } from './unitemanutentionsortie-document.service';

@Component({
  selector: 'app-unitemanutentionsortie-document',
  templateUrl: './unitemanutentionsortie-document.component.html',
  styleUrls: ['./unitemanutentionsortie-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UnitemanutentionsortieDocumentComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;

  public contentHeader: Object;
  
  public ums: UMS;
  public bcs: BCS;
  
  public coreConfig: any;
  
  public type: String;

  constructor(
    private _umsDocumentService: UnitemanutentionsortieDocumentService,
    private _coreConfigService: CoreConfigService
  ) { 
    this._unsubscribeAll = new Subject();
    this.bcs = new BCS();
    this.type = _umsDocumentService.type;
  }

  ngOnInit(): void {
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this._umsDocumentService.onUMSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response : UMS) => {
        this.ums = response;
        console.log(this.ums);
        
        this.bcs = this.ums.bcs;
      }
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
