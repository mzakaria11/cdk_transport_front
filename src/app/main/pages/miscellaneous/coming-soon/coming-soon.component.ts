import { Component, OnInit } from '@angular/core';
import { CoreConfigService } from '@core/services/config.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit {
  public coreConfig: any;

  private _unsubscribeAll: Subject<any>;

  constructor(private _coreConfigService: CoreConfigService) {
    this._unsubscribeAll = new Subject();

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  ngOnInit(): void {
    this._coreConfigService.config
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      config => {
        this.coreConfig = config;
      }
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
