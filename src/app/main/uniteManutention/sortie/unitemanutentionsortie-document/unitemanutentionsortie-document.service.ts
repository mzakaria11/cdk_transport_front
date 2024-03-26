import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { UMS } from '../ums.model';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionsortieDocumentService implements Resolve<any> {

  public rows: any;
  public onUMSDetailChanged: BehaviorSubject<any>;
  public type: String;
  constructor(private _httpClient: HttpClient) { 
    this.onUMSDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let currentId = Number(route.paramMap.get('id'));
    this.type = route.url[2].path === 'colisage' ? 'colisage' : 'stock';
       
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(id: number): Promise<UMS[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ums/${id}`)
        .subscribe(
          (response: UMS) => {            
            this.rows = response;
            this.onUMSDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }
}
