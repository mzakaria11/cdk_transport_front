import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { BCS, LignBcsRequest } from '../bcs.model';

@Injectable({
  providedIn: 'root'
})
export class DetailBcsService implements Resolve<any> {

  public bcs: BCS;
  public onBCSDetailChanged: BehaviorSubject<any>;
  public onLignesChanged: BehaviorSubject<any>;
  public editable: boolean = false;
  
  private id: number;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBCSDetailChanged = new BehaviorSubject({});
    this.onLignesChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    this.id = Number(route.paramMap.get('id'));
    this.editable = route.url[0].path === 'edit' ? true : false;

    return new Promise<void>(
      (resolve, reject) => {
        Promise.all(
          [
            this.getBCSApiData(),
            this.getLignesDataRows()
          ]
        ).then(
          () => {
            resolve();
          }, reject
        );
      }
    );  
  }

  getBCSApiData(): Promise<any> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bcs/${this.id}`)
        .subscribe(
          async (response: any) => {            
            this.bcs = response;
            this.onBCSDetailChanged.next(this.bcs);  
            resolve(this.bcs);
          }, reject
        );
      }
    );
  }

  getLignesDataRows(request: LignBcsRequest = new LignBcsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.idArticle ? `&idArticle=${request.idArticle}` : '';
        filter += request.stat ? `&stat=${request.stat}` : '';

        filter += request.sort ? request.sort : '';
        
        this._httpClient.get(`${environment.api}/lignebcs/bcs/${this.id}?${filter}`)
        .subscribe(
          (response: APiResponse) => {                       
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

    return this._httpClient.delete<String>(`${environment.api}/bcs/delete/${this.id}`, requestOptions);
  }

  update(body): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/bcs/update`, body);
  }

  addLigne(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/lignebcs/complement`, body);
  }
    
  setUmsDateExpeditionByBcs(ts: number): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ums/bcs/${this.id}?ts=${ts}`, {});
  }
}
