import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BCS } from '../bcs.model';

@Injectable({
  providedIn: 'root'
})
export class BoncommandsortieNewService implements Resolve<any> {

  public rows: any;
  public onBCSNewChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBCSNewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBCSsDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBCSsDataRows(): Promise<BCS[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bcs`)
        .subscribe(
          (response: BCS) => {            
            this.rows = response;
            this.onBCSNewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  importBcsToDB(body): Observable<any> {
    return this._httpClient.post(`${environment.api}/bcs/importAll`, body);
  }

  importLigneBcsToDB(body): Observable<any> {
    return this._httpClient.post(`${environment.api}/lignebcs/importAll`, body);
  }

  deleteImported(): Observable<any> {
    return this._httpClient.post(`${environment.api}/bcs/delete-imported`, {}, {responseType: 'text'});
  }
}

