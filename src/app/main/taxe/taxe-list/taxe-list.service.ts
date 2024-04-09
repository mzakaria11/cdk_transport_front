import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TaxeListService {

  public rows: any;
  public onTarifMssListChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onTarifMssListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getTarifMsssDataRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getTarifMsssDataRows(): Promise<any[]>  {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get(`${environment.api}/taxe`)
              .subscribe(
                  (response: any) => {
                    this.rows = response;
                    this.onTarifMssListChanged.next(this.rows);
                    resolve(this.rows);
                  }, reject
              );
        }
    );
  }




}
