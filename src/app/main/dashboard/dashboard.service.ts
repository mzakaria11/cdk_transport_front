import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DashboardService {

  public apiData: any;
  public onApiClientDataChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onApiClientDataChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.cliantLastCmd()]).then(() => {
        resolve();
      }, reject);
    });
  }

  cliantLastCmd(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environment.api}/dashboard/client/lastcmd`).subscribe((response: any) => {
        this.apiData = response;
        this.onApiClientDataChanged.next(this.apiData);
        resolve(this.apiData);
      }, reject);
    });
  }

  cliantLastCmdByCode(codeUm: string): Observable<any> {
    return this._httpClient.get(`${environment.api}/dashboard/client/lastcmd/${codeUm}`);
  }
}
