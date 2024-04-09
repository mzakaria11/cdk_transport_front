import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType} from "@angular/common/http";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Departement} from "../../departement/departement.model";
import {environment} from "../../../../environments/environment";
import {Transporteur} from "../../transporteur/transporteur.model";
import {TarifMss} from "../../tarif-mss/tarif-mss.model";

@Injectable({
  providedIn: 'root'
})
export class TaxeNewService {

  public apiData: any;
  public onTarifMssNewChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onTarifMssNewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(): Promise<any[]> {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get('api/users-data')
              .subscribe(
                  (response: any) => {
                    this.apiData = response;
                    this.onTarifMssNewChanged.next(this.apiData);
                    resolve(this.apiData);
                  }, reject
              );
        }
    );
  }

  getDepartements(): Observable<Departement[]> {

    var name = this._httpClient.get<Departement[]>(`${environment.api}/departement/all`);
    console.log(name)
    return name;
  }

  getTransporteurs(): Observable<Transporteur[]> {
    return this._httpClient.get<Transporteur[]>(`${environment.api}/transporteurs/all`);
  }

  addTarifMss(body: any): Observable<TarifMss> {
    console.log(body);
    return this._httpClient.post<TarifMss>(`${environment.api}/taxe`, body);

  }

  checkFiles(location: string, file: string): Observable<any> {
    return this._httpClient.get(`${environment.api}/${location}/file/${file}`);
  }

}
