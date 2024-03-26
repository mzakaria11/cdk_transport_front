import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { BcsRequest } from '../bcs.model';

@Injectable({
  providedIn: 'root'
})
export class BoncommandsortieListService implements Resolve<any> {

  public bcs: any;
  public onBcsListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBcsListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBcsDataRows(new BcsRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBcsDataRows(request: BcsRequest = new BcsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.numeroCommande ? `&numeroCommande=${request.numeroCommande}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.termine ? `&termine=${request.termine}` : '';
        filter += request.dateStart ? `&dateStart=${request.dateStart}` : '';
        filter += request.dateEnd ? `&dateEnd=${request.dateEnd}` : '';
        filter += request.sort ? request.sort : '&sort=idBonCommandeSortie,Desc';
                
        this._httpClient.get(`${environment.api}/bcs?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.bcs = response;
            this.onBcsListChanged.next(this.bcs);
            resolve(this.bcs);
          }, reject
        );        
      }
    );
  }

  getBcsDataRowsSortedByCodeUM(request: BcsRequest = new BcsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.numeroCommande ? `&numeroCommande=${request.numeroCommande}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.termine ? `&termine=${request.termine}` : '';
        filter += request.dateStart ? `&dateStart=${request.dateStart}` : '';
        filter += request.dateEnd ? `&dateEnd=${request.dateEnd}` : '';
        filter += `&dir=${request.dir}`;
                
        this._httpClient.get(`${environment.api}/bcs/sort?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.bcs = response;
            this.onBcsListChanged.next(this.bcs);
            resolve(this.bcs);
          }, reject
        );        
      }
    );
  }

  getImportedBCSsDataRows(): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/bcs/imported?page=0&size=200`)
        .subscribe(
          (response: APiResponse) => {            
            this.bcs = response;
            this.onBcsListChanged.next(this.bcs);
            resolve(this.bcs);
          }, reject
        );
      }
    );
  }

  exportBlsPdf(body: any[]): Observable<any[]> {
    return this._httpClient.post<any[]>(`${environment.api}/bls/export/pdf`, body)
  }
  
}
