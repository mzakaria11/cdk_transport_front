import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Destinataire } from '../destinataire.model';

@Injectable({
  providedIn: 'root'
})
export class DestinataireListService implements Resolve<any> {

  public rows: any;
  public onDestinataireListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onDestinataireListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDestinatairesDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getDestinatairesDataRows(): Promise<any[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/destinataires`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onDestinataireListChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  getDestinataire(): Observable<Destinataire[]> {
    return this._httpClient.get<Destinataire[]>(`${environment.api}/destinataires`);
  }
}
