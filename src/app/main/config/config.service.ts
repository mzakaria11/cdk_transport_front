import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements Resolve<any> {
  rows: any;
  onConfigChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onConfigChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environment.api}/conf`)
      .subscribe(
        (response: any) => {
          console.log(response);
          
          this.rows = response;
          this.onConfigChanged.next(this.rows);
          resolve(this.rows);
        }
      , reject);
    });
  }

  save(body): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/conf`, body, requestOptions);
  }

  activate(body): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/conf/set-active`, body, requestOptions);
  }
}
