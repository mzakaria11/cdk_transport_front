import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BLS } from '../bls.model';
import { BoncommandsortieDetailService } from 'app/main/bonCommand/sortie/boncommandsortie-detail/boncommandsortie-detail.service';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonsortieNewService implements Resolve<any> {

  public rows: any;
  public onBLSNewChanged: BehaviorSubject<any>;

  constructor(
    private _httpClient: HttpClient, 
    private _bcsDetailService: BoncommandsortieDetailService
  ) { 
    this.onBLSNewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    let idBcs = Number(route.paramMap.get('id'));

    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBLSsDataRows(), this._bcsDetailService.getApiData(idBcs)]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBLSsDataRows(): Promise<BLS[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bls`)
        .subscribe(
          (response: BLS) => {            
            this.rows = response;
            this.onBLSNewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addBls(body: any): Observable<BLS> {
    return this._httpClient.post<BLS>(`${environment.api}/bls`, body);
  }
}

