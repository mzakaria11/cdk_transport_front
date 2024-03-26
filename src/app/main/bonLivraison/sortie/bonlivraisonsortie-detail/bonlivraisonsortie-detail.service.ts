import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BLS } from '../bls.model';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonsortieDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onBLSDetailChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBLSDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.editable = route.url[0].path === 'edit' ? true : false;
    let currentId = Number(route.paramMap.get('id'));
    
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(id: number): Promise<BLS[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bls/${id}`)
        .subscribe(
          (response: BLS) => {            
            this.rows = response;
            this.onBLSDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  deleteBls(id: number): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<String>(`${environment.api}/bls/delete/${id}`, requestOptions);
  }
}
