import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {TarifAff} from "../tarif-aff.model";

@Injectable({
  providedIn: 'root'
})
export class TarifAffListService implements Resolve<any> {

  public rows: any;
  public onTarifAffListChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onTarifAffListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getTarifAffsDataRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getTarifAffsDataRows(): Promise<any[]>  {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get(`${environment.api}/tarifaff`)
              .subscribe(
                  (response: any) => {
                    this.rows = response;
                    this.onTarifAffListChanged.next(this.rows);
                    resolve(this.rows);
                  }, reject
              );
        }
    );
  }

  getTarifAff(): Observable<TarifAff[]> {
    return this._httpClient.get<TarifAff[]>(`${environment.api}/tarifaff`);
  }
}
