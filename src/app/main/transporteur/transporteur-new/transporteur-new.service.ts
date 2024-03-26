import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Transporteur } from '../transporteur.model';

@Injectable({
  providedIn: 'root'
})
export class TransporteurNewService implements Resolve<any> {

  public apiData: any;
  public onTransporteurNewChanged: BehaviorSubject<any>;


  constructor(private _httpClient: HttpClient) {
    this.onTransporteurNewChanged = new BehaviorSubject({});
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
            this.onTransporteurNewChanged.next(this.apiData);
            resolve(this.apiData);
          }, reject
        );
      }
    );
  }

  addTransporteur(body: any): Observable<Transporteur> {
    return this._httpClient.post<Transporteur>(`${environment.api}/transporteurs`, body);
  }
}
