import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { StatisticRep } from '../repartition.model';

@Injectable({
  providedIn: 'root'
})
export class RepartitionStatisticService implements Resolve<any> {

  public repartitions: any;

  public onReparticleRuptureChanged: BehaviorSubject<any>;
  public onRepStatArticleChanged: BehaviorSubject<any>;
  public onRepStatYearChanged: BehaviorSubject<any>;
  public onRepStatChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onReparticleRuptureChanged = new BehaviorSubject({});
    this.onRepStatArticleChanged = new BehaviorSubject({});
    this.onRepStatYearChanged = new BehaviorSubject({});
    this.onRepStatChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>(
      (resolve, reject) => {
        Promise.all(
          [
            this.getRepartitionStat(),
            this.getRepartitionStatByYear(),
            this.getRepartitionStatByArticle(),
            this.getRepartitionStatByArticleRupture(),
          ]
        ).then(() => {
          resolve();
        }, reject);
      }
    );  
  }

  getRepartitionStat(filters?: StatisticRep): Promise<any>  {
    return new Promise(
      (resolve, reject) => {                   
        this._httpClient.get(`${environment.api}/script/repstat${this.addParams(filters)}`)
        .subscribe(
          (response: any) => {             
            this.onRepStatChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getRepartitionStatByYear(filters?: StatisticRep): Promise<any>  {
    return new Promise(
      (resolve, reject) => {           
        this._httpClient.get(`${environment.api}/script/repstatyear${this.addParams(filters)}`)
        .subscribe(
          (response: any) => {                        
            this.onRepStatYearChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getRepartitionStatByArticle(filters?: StatisticRep): Promise<any>  {
    return new Promise(
      (resolve, reject) => {           
        this._httpClient.get(`${environment.api}/script/repstatarticle${this.addParams(filters)}`)
        .subscribe(
          (response: any) => {             
            this.onRepStatArticleChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getRepartitionStatByArticleRupture(filters?: StatisticRep): Promise<any>  {
    return new Promise(
      (resolve, reject) => {           
        this._httpClient.get(`${environment.api}/script/repstatarticle_rupture${this.addParams(filters)}`)
        .subscribe(
          (response: any) => {             
            this.onReparticleRuptureChanged.next(response);
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getCmdData(cmd: string): Observable<any> {
    return this._httpClient.get(`${environment.api}/script/cmd/${cmd}`);
  }

  private addParams(filters: StatisticRep): string {
    let params = '';
        
    if (filters?.dateStart) {
      params = `?dateStart=${filters.dateStart / 1000}`;
    }       

    if (filters?.dateEnd) {
      params += filters.dateStart ? `&dateEnd=${filters.dateEnd / 1000}` : `?dateEnd=${filters.dateEnd / 1000}`;
    }       

    if (filters?.dateStartExp) {
      params = `?dateStartExp=${filters.dateStartExp / 1000}`;
    }       

    if (filters?.dateEndExp) {
      params += filters.dateStartExp ? `&dateEndExp=${filters.dateEndExp / 1000}` : `?dateEndExp=${filters.dateEndExp / 1000}`;
    }       

    if (filters?.idArticle) {
      params += filters.dateStart || filters.dateEnd || filters.dateStartExp || filters.dateEndExp ? `&article=${filters.idArticle}` : `?article=${filters.idArticle}`;
    }       

    if (filters?.idDestinataire) {
      params += filters.dateStart || filters.dateEnd || filters.dateStartExp || filters.dateEndExp || filters.idArticle ? `&destinataire=${filters.idDestinataire}` : `?destinataire=${filters.idDestinataire}`;
    }  
    
    return params;
  }
}