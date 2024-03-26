import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ZoneDepot } from '../zonedepot.model';
import { APiResponse } from 'app/api-response';

@Injectable({
  providedIn: 'root'
})
export class ZonedepotListService implements Resolve<any> {

  public rows: any;
  public onZoneListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onZoneListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getZONEsDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getZONEsDataRows(): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/zone/all`)
        .subscribe(
          (response: APiResponse) => {            
            this.rows = response.data;
            this.onZoneListChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addZone(body: any) {
    return this._httpClient.post(`${environment.api}/zone`, body);
  }

  deleteZone(id: number): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.delete<String>(`${environment.api}/zone/${id}`, requestOptions);
  }
}
