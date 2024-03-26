import { Component, OnInit } from '@angular/core';

import { filter, pairwise, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { AuthenticationService } from 'app/auth/service';
import { Router, RoutesRecognized } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  public coreConfig: any;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _coreConfigService: CoreConfigService, 
    private _userService: AuthenticationService,
    private router: Router
  ) {
    
    // router.events
    // .pipe(
    //   filter(
    //     (evt: any) => evt instanceof RoutesRecognized
    //   ), pairwise()
    // )
    // .subscribe(
    //   (events: RoutesRecognized[]) => {
    //     console.log('previous url', events[0].urlAfterRedirects);
    //     console.log('current url', events[1].urlAfterRedirects);
    //   }
    // )
    
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
