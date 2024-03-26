import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { RepartitionRequest } from '../repartition.model';

@Injectable({
  providedIn: 'root'
})
export class RepartitionDetailService implements Resolve<any> {

  public repartitions: any;

  public onRepartitionChanged: BehaviorSubject<any>;
  public onOutOfStockChanged: BehaviorSubject<any>;
  public onInsStockChanged: BehaviorSubject<any>;
  public onCountChanged: BehaviorSubject<any>;
  public onArticleByRepChanged: BehaviorSubject<any>;

  public ts: number;
  
  constructor(private _httpClient: HttpClient) { 
    this.onRepartitionChanged = new BehaviorSubject({});
    this.onOutOfStockChanged = new BehaviorSubject({});
    this.onInsStockChanged = new BehaviorSubject({});
    this.onCountChanged = new BehaviorSubject({});
    this.onArticleByRepChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    this.ts = new Date(parseInt(route.paramMap.get('id'))).setHours(4) / 1000;        

    console.log(parseInt(route.paramMap.get('id')));
    console.log(this.ts);
    
    return new Promise<void>(
      (resolve, reject) => {
        Promise.all(
          [
            this.getRepartitionDataRows(new RepartitionRequest()),
            this.getOutOfStockDataRows(),
            this.getInsStockDataRows(),
            this.getUmsStatDataRows(),
            this.getStatArticleDataRows({}),
          ]
        ).then(() => {
          resolve();
        }, reject);
      }
    );  
  }

  getRepartitionDataRows(request: RepartitionRequest = new RepartitionRequest()): Promise<APiResponse>  { 
    return new Promise(
      (resolve, reject) => {      
                 
        let filter: string = `page=${request.page.offset}&size=${request.page.size}&ts=${this.ts}`;

        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.dir ? `&dir=${request.dir}` : '';

        if (!request.dir) {
          filter += request.sort ? request.sort : '';
        }
                              
        this._httpClient.get(`${environment.api}/bcs/repartition?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.repartitions = response;
            this.onRepartitionChanged.next(this.repartitions);
            resolve(this.repartitions);
          }, reject
        );        
      }
    );
  }

  getOutOfStockDataRows(): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {                              
        this._httpClient.get(`${environment.api}/script/outofstock/${this.ts}`)
        .subscribe(
          (response: APiResponse) => {  
            this.onOutOfStockChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getInsStockDataRows(): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {                              
        this._httpClient.get(`${environment.api}/script/insstock/${this.ts}`)
        .subscribe(
          (response: APiResponse) => {  
            this.onInsStockChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getUmsStatDataRows(): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {                              
        this._httpClient.get(`${environment.api}/script/umsstat/${this.ts}`)
        .subscribe(
          (response: APiResponse) => {  
            this.onCountChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getStatArticleDataRows(filters: {destinataire?: number, article?: number }): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {   
        console.log(filters);
        
        let filter: string = `ts=${this.ts}`;

        filter += filters.destinataire ? `&destinataire=${filters.destinataire}` : '';
        filter += filters.article ? `&article=${filters.article}` : '';

        this._httpClient.get(`${environment.api}/script/articlebyrep?${filter}`)
        .subscribe(
          (response: APiResponse) => {  
            this.onArticleByRepChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  sendEmails(): Observable<any> {
    return this._httpClient.get(`${environment.api}/email/current/${this.ts}`);
  }

  genererBl(dateExpedition): Observable<any> {
    return this._httpClient.get(`${environment.api}/script/generate/bls/${this.ts}/${dateExpedition}`);
  }

}