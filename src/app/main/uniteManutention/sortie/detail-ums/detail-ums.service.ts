import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { ColisListRequest, UMS, UmsRequest } from '../ums.model';

@Injectable({
  providedIn: 'root'
})
export class DetailUmsService implements Resolve<any> {

  public ums: UMS;
  public onUMSDetailChanged: BehaviorSubject<any>;
  public onColisListChanged: BehaviorSubject<any>;
  public editable: boolean = false;
  
  private id: number;
  
  constructor(private _httpClient: HttpClient) { 
    this.onUMSDetailChanged = new BehaviorSubject({});
    this.onColisListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    this.id = Number(route.paramMap.get('id'));
    this.editable = route.url[0].path === 'edit' ? true : false;

    return new Promise<void>(
      (resolve, reject) => {
        Promise.all(
          [
            this.getUMSApiData(),
            this.getColisListDataRows(new ColisListRequest())
          ]
        ).then(
          () => {
            resolve();
          }, reject
        );
      }
    );  
  }

  getUMSApiData(): Promise<any> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ums/${this.id}`)
        .subscribe(
          async (response: any) => {            
            this.ums = response;
            this.onUMSDetailChanged.next(this.ums);  
            resolve(this.ums);
          }, reject
        );
      }
    );
  }

  getColisListDataRows(request: ColisListRequest = new ColisListRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.article ? `&article=${request.article}` : '';
        filter += request.stat ? `&stat=${request.stat}` : '';
        filter += request.idColis ? `&idColis=${request.idColis}` : '';
        filter += request.numerotation ? `&numerotation=${request.numerotation}` : '';
        filter += request.sort ? request.sort : '';
                
        console.log(filter);
        
        this._httpClient.get(`${environment.api}/colis/ums/${this.id}?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.onColisListChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  delete(): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.delete<String>(`${environment.api}/ums/delete/${this.id}`, requestOptions);
  }

  update(body): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ums/update`, body);
  }

  closeUms(body): Observable<UMS> {
    return this._httpClient.post<UMS>(`${environment.api}/ums/closure`, body);
  }
}
