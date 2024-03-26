import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { UmsRequest } from '../ums.model';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionsortieListService implements Resolve<any> {

  public ums: any;
  public onUmsListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onUmsListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getUmsDataRows(new UmsRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getUmsDataRows(request: UmsRequest = new UmsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.operation ? `&operation=${request.operation}&poid=${request.poid}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.stat ? `&stat=${request.stat}` : '';
        
        filter += request.dateStartOuv ? `&dateStartOuv=${request.dateStartOuv}` : '';
        filter += request.dateEndOuv ? `&dateEndOuv=${request.dateEndOuv}` : '';

        filter += request.dateStartFer ? `&dateStartFer=${request.dateStartFer}` : '';
        filter += request.dateEndFer ? `&dateEndFer=${request.dateEndFer}` : '';

        filter += request.dateStartExp ? `&dateStartExp=${request.dateStartExp}` : '';
        filter += request.dateEndExp ? `&dateEndExp=${request.dateEndExp}` : '';

        filter += request.sort ? request.sort : '&sort=idBonCommandeSortie,Desc';
                
        this._httpClient.get(`${environment.api}/ums/test?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.ums = response;
            this.onUmsListChanged.next(this.ums);
            resolve(this.ums);
          }, reject
        );        
      }
    );
  }

  getUmsDataRowsSortedByCodeUM(request: UmsRequest = new UmsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.operation ? `&operation=${request.operation}&poid=${request.poid}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.stat ? `&stat=${request.stat}` : '';

        filter += request.dateStartOuv ? `&dateStartOuv=${request.dateStartOuv}` : '';
        filter += request.dateEndOuv ? `&dateEndOuv=${request.dateEndOuv}` : '';

        filter += request.dateStartFer ? `&dateStartFer=${request.dateStartFer}` : '';
        filter += request.dateEndFer ? `&dateEndFer=${request.dateEndFer}` : '';

        filter += request.dateStartExp ? `&dateStartExp=${request.dateStartExp}` : '';
        filter += request.dateEndExp ? `&dateEndExp=${request.dateEndExp}` : '';

        filter += `&dir=${request.dir}`;
                
        this._httpClient.get(`${environment.api}/ums/sort?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.ums = response;
            this.onUmsListChanged.next(this.ums);
            resolve(this.ums);
          }, reject
        );        
      }
    );
  }

  exportBlsPdf(body: any[]): Observable<any[]> {
    return this._httpClient.post<any[]>(`${environment.api}/bls/export/pdf`, body)
  }
 
  closeUmsOnMass(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/script/closelastums`, body);
  }

  printEtiquette(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ums/printetiquette`, body);
  }

  generateColisageMass(body: number[]): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ums/colisage`, body);
  }
}
