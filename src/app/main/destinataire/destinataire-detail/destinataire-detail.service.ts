import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Destinataire } from '../destinataire.model';

@Injectable({
  providedIn: 'root'
})
export class DestinataireDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onDestinataireDetailChanged: BehaviorSubject<any>;
  
  private currentId;

  constructor(private _httpClient: HttpClient) { 
    this.onDestinataireDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<Destinataire[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/destinataires/${id}`)
        .subscribe(
          (response: Destinataire) => {            
            this.rows = response;
            this.onDestinataireDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  updateDestinataire(body): Observable<Destinataire> {
    return this._httpClient.post<Destinataire>(`${environment.api}/destinataires/update`, body);
  }
  
  deleteDestinataire(id: number = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/destinataires/delete/${id}`, requestOptions);
  }
}
