import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BCS, LignBcsRequest } from '../bcs.model';
import { APiResponse } from 'app/api-response';

@Injectable({
  providedIn: 'root'
})
export class BoncommandsortieDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onBCSDetailChanged: BehaviorSubject<any>;
  
  private id: number;

  constructor(private _httpClient: HttpClient) { 
    this.onBCSDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.editable = route.url[0].path === 'edit' ? true : false;
    this.id = Number(route.paramMap.get('id'));
    
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(this.id), this.getLigneDataRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(id: number): Promise<BCS> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bcs/${id}`)
        .subscribe(
          (response: BCS) => {            
            this.rows = response;
            this.onBCSDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  getLigneDataRows(request: LignBcsRequest = new LignBcsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.idArticle ? `&idArticle=${request.idArticle}` : '';
        filter += request.stat ? `&stat=${request.stat}` : '';
                
        this._httpClient.get(`${environment.api}/lignebcs/bcs/${this.id}?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            console.log(response);
            
            resolve(response);
          }, reject
        );        
      }
    );
  }

  confirmAll(idBcs): Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/lignebcs/confirm/${idBcs}/all`);
  }

  confirmLignes(idLigne, idArticle, idUms): Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/lignebcs/confirm/${idLigne}/${idArticle}/${idUms}`);
  }

  deleteBcs(id = this.id): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/bcs/delete/${id}`, requestOptions);
  }

  addLigne(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/lignebcs/complement`, body);
  }
}
