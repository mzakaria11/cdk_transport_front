import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Stat } from '../script.model';


interface Statistic {
  colis?: number;
  enStock?: number;
  insuffisante?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptHistoryService implements Resolve<any> {

  private apiData: any;
  public onHistoryChanged: BehaviorSubject<any>;
  public stat: Statistic = {};
  public ts: number;

  constructor(
    private _httpClient: HttpClient
  ) { 
    this.onHistoryChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    this.ts = Number(route.paramMap.get('ts')) / 1000;
    
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getHistoryData(this.ts)]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getHistoryData(ts: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environment.api}/script/history/${ts}/bcs`).subscribe(
        (response: any) => {          
          this.apiData = response;
          let stats: Stat = response.stat;

          this.stat.colis = Math.ceil((stats.totalQteColis * 100) / stats.totalColisDemande);
          this.stat.enStock = Math.ceil((stats.qteLigneDiffEZero * 100) / stats.totalQteLigne);
          this.stat.insuffisante = Math.ceil((stats.qteLigneDiffMZero * 100) / stats.totalQteLigne);

          this.onHistoryChanged.next(this.apiData);
          resolve(this.apiData);
        }, 
        reject
      );
    });
  }

  generatedBls(ts: number): Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/bls/${ts}`);
  }

  stockUms(ts: number): Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/stock/${ts}`);
  }

  colisage(ts: number) : Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/colisage/${ts}`);
  }

  volume(ts: number) : Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/volume/${ts}`);
  }

  blByBcs(id: number) : Observable<any> {
    let ids = [];
    ids.push(id);
    return this._httpClient.post<any>(`${environment.api}/bls/export/pdf`, ids);
  }

  stockByBcs(id: number) : Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/stock/bcs/${id}`);
  }

  colisageByBcs(id: number) : Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/colisage/bcs/${id}`);
  }

  colisageByUms(id: number) : Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/document/colisage/ums/${id}`);
  }
}
