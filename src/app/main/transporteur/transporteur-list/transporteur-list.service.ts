import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Transporteur } from '../transporteur.model';

@Injectable({
  providedIn: 'root'
})
export class TransporteurListService implements Resolve<any> {

  public rows: any;
  public onTransporteurListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onTransporteurListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getTransporteursDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getTransporteursDataRows(): Promise<any[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/transporteurs?page=0&size=20`)
        .subscribe(
          (response: any) => {            
            this.rows = response;

            this.onTransporteurListChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  getTransporteur(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${environment.api}/transporteurs`);
  }
}
