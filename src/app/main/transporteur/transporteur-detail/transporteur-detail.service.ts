import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Transporteur } from '../transporteur.model';

@Injectable({
  providedIn: 'root'
})
export class TransporteurDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onTransporteurDetailChanged: BehaviorSubject<any>;
  
  private currentId;
  
  constructor(private _httpClient: HttpClient) { 
    this.onTransporteurDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.editable = route.url[0].path === 'edit' ? true : false;
    this.currentId = Number(route.paramMap.get('id'));
    
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(this.currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(id: number): Promise<Transporteur[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/transporteurs/${id}`)
        .subscribe(
          (response: Transporteur) => {            
            this.rows = response;
            this.onTransporteurDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  updateTransporteur(body): Observable<Transporteur> {
    return this._httpClient.post<Transporteur>(`${environment.api}/transporteurs/update`, body);
  }
  
  deleteTransporteur(id = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/transporteurs/delete/${id}`, requestOptions);
  }
}
