import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Colis, ColisRequest, UME } from '../ume.model';
import { APiResponse } from 'app/api-response';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionentreeDetailService implements Resolve<any> {

  public rows: any;
  public colis: any;
  public editable: boolean = false;
  public onUMEDetailChanged: BehaviorSubject<any>;
  public onColisDetailChanged: BehaviorSubject<any>;
  
  private currentId: Number;

  constructor(
    private _httpClient: HttpClient
  ) { 
    this.onUMEDetailChanged = new BehaviorSubject({});
    this.onColisDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<UME[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ume/${id}`)
        .subscribe(
          async (response: UME) => {            
            this.rows = response;
            this.onUMEDetailChanged.next(this.rows);  
            
            let ColisResponse = await new Promise<any>(
              resolve => {
                if (this.rows.colis[0]) {
                  resolve(this.getColisApiData(this.rows.id, this.rows?.colis[0].article.id));
                }
              }
            )
            if (ColisResponse) {
              resolve(this.rows);
            }
          }, reject
        );
      }
    );
  }

  getColisApiData(idUme: number, idArticle): Promise<UME[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/colis/ume=${idUme}&article=${idArticle}`)
        .subscribe(
          (response: UME) => {                                  
            this.colis = response;
            this.onColisDetailChanged.next(this.colis);
            resolve(this.colis);
          }, reject
        );
      }
    );
  }

  getColis(idUme: number, idArticle: number): Observable<any> {
    return this._httpClient.get(`${environment.api}/colis/ume=${idUme}&article=${idArticle}`);
  }

  print(): Observable<any> {
    return this._httpClient.get(`${environment.api}/ume/print`, { responseType: 'text' });
  }

  repartir(idArticle, body): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/repartir/${idArticle}`, body);
  }

  printEtiquette(idUme, idArticle, stat, body): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/printetiquette/${stat}/${idUme}/${idArticle}`, body);
  }

  printByColis(id: number): Observable<any> {
    return this._httpClient.get(`${environment.api}/ume/print/colis/${id}`);
  }

  getUmeByBle(idBle): Observable<APiResponse> {
    return this._httpClient.get<APiResponse>(`${environment.api}/ume/ble/${idBle}`);
  }

  addColis(body: any): Observable<Colis> {
    return this._httpClient.post<Colis>(`${environment.api}/colis`, body);
  }

  updateColis(body: any): Observable<Colis> {
    return this._httpClient.post<Colis>(`${environment.api}/colis/emplacement`, body);
  }

  updateSetPrinted(body: any): Observable<Colis> {
    return this._httpClient.post<Colis>(`${environment.api}/colis/printed`, body);
  }

  updateUme(body): Observable<UME> {
    return this._httpClient.post<UME>(`${environment.api}/ume/update`, body);
  }

  updateEmplacement(idUme, idArticle, body): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ume/emplacement/${idUme}/${idArticle}`, body);
  }

  delier(idColis): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/colis/delier/${idColis}`, {});
  }
   
  deleteUme(id = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.delete<String>(`${environment.api}/ume/delete/${id}`, requestOptions);
  }

  getColisDataRows(request: ColisRequest = new ColisRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.idDestinataire ? `&idDestinataire=${request.idDestinataire}` : '';
        filter += request.stock ? `&stock=${request.stock}` : '';
        
        this._httpClient.get(`${environment.api}/articles?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.onColisDetailChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }
}