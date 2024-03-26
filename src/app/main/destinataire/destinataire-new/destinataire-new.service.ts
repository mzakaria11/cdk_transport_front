import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Destinataire } from '../destinataire.model';

@Injectable({
  providedIn: 'root'
})
export class DestinataireNewService implements Resolve<any> {

  public apiData: any;
  public onDestinataireNewChanged: BehaviorSubject<any>;


  constructor(private _httpClient: HttpClient) {
    this.onDestinataireNewChanged = new BehaviorSubject({});
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
            this.onDestinataireNewChanged.next(this.apiData);
            resolve(this.apiData);
          }, reject
        );
      }
    );
  }

  addDestinataire(body: any): Observable<Destinataire> {
    return this._httpClient.post<Destinataire>(`${environment.api}/destinataires`, body);
  }
}
