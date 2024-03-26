import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { UMS } from '../ums.model';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionsortieDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onUMSDetailChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onUMSDetailChanged = new BehaviorSubject({});
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

  updateUms(body): Observable<UMS> {
    return this._httpClient.post<UMS>(`${environment.api}/ums/update`, body);
  }

  deleteUms(id): Observable<any> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.delete<String>(`${environment.api}/ums/delete/${id}`, requestOptions);
  }
  
  updateUmsDateExpedition(body): Observable<UMS> {
    return this._httpClient.post<UMS>(`${environment.api}/ums/expedition`, body);
  }

  closeUms(body): Observable<UMS> {
    return this._httpClient.post<UMS>(`${environment.api}/ums/closure`, body);
  }
}
