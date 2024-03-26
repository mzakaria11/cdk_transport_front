import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BonlivraisonentreeDetailService } from 'app/main/bonLivraison/entree/bonlivraisonentree-detail/bonlivraisonentree-detail.service';
import { UME } from '../ume.model';
import { APiResponse } from 'app/api-response';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionentreeNewService implements Resolve<any> {

  public rows: any;
  public onUMENewChanged: BehaviorSubject<any>;
  
  constructor(
    private _httpClient: HttpClient, 
    private _detailBleService: BonlivraisonentreeDetailService
  ) { 
    this.onUMENewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    let bleId = Number(route.paramMap.get('id'));

    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getUMEsDataRows(), this._detailBleService.getApiData(bleId)]).then(() => {
        resolve();
      }, reject);
    });  
  }
  

  getUMEsDataRows(): Promise<APiResponse[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ume`)
        .subscribe(
          (response: APiResponse) => {            
            this.rows = response;
            this.onUMENewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addUme(body: any): Observable<UME> {
    return this._httpClient.post<UME>(`${environment.api}/ume`, body);
  }
}

