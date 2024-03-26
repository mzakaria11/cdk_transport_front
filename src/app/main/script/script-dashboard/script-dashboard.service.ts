import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ScriptStat } from '../script.model';
import { BLS } from 'app/main/bonLivraison/sortie/bls.model';

@Injectable({
  providedIn: 'root'
})
export class ScriptDashboardService implements Resolve<any> {

  private apiData: any;
  private apiVolumeData: any;
  public onScriptChanged: BehaviorSubject<any>;
  public onVolumeChanged: BehaviorSubject<any>;
  
  constructor(
    private _httpClient: HttpClient
  ) { 
    this.onScriptChanged = new BehaviorSubject({});
    this.onVolumeChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getStatData(), this.getVolumeData()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getStatData(): Promise<ScriptStat[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environment.api}/script/stat`).subscribe((response: any) => {
        this.apiData = response;
        this.onScriptChanged.next(this.apiData);
        resolve(this.apiData);
      }, reject);
    });
  }

  getStatDataByUme(idUme: number): Observable<ScriptStat[]> {
    return this._httpClient.get<ScriptStat[]>(`${environment.api}/script/stat/ume/${idUme}`);
  }

  getVolumeData(): Promise<ScriptStat[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get<any>(`${environment.api}/bls/generated`).subscribe((response: any) => {
        if (response.length > 0) {
          this.apiVolumeData = response[0].volume;
          this.onVolumeChanged.next(this.apiVolumeData);
        }

        resolve(this.apiVolumeData);
      }, reject);
    });
  }

  startScript(): Observable<ScriptStat> {
    return this._httpClient.get<ScriptStat>(`${environment.api}/script/repartir`);
  }

  generateBls(tsC: number, tsExpedition: number): Observable<BLS[]> {
    return this._httpClient.get<BLS[]>(`${environment.api}/script/generate/bls/${tsC}/${tsExpedition}`);
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

  stockStat(stat, ts): Observable<any> {
    return this._httpClient.get<any>(`${environment.api}/script/stock/${stat}/${ts}`);
  }
}
