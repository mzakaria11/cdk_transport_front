import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { BlsRequest } from '../bls.model';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonsortieListService implements Resolve<any> {

  public bls: any;
  public onBlsListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBlsListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBlsDataRows(new BlsRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBlsDataRows(request: BlsRequest = new BlsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.numeroBl ? `&numeroBl=${request.numeroBl}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.transporteur ? `&transporteur=${request.transporteur}` : '';
        filter += request.dateDebut ? `&dateDebut=${request.dateDebut}` : '';
        filter += request.dateFin ? `&dateFin=${request.dateFin}` : '';
        filter += request.sort ? request.sort : '&sort=idBonLivraisonSortie,desc';
        
        console.log(filter);
        
        this._httpClient.get(`${environment.api}/bls?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.bls = response;
            this.onBlsListChanged.next(this.bls);
            resolve(this.bls);
          }, reject
        );        
      }
    );
  }

  getBlsDataRowsSortedByCodeUM(request: BlsRequest = new BlsRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.numeroBl ? `&numeroBl=${request.numeroBl}` : '';
        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.transporteur ? `&transporteur=${request.transporteur}` : '';
        filter += request.dateDebut ? `&dateDebut=${request.dateDebut}` : '';
        filter += request.dateFin ? `&dateFin=${request.dateFin}` : '';
        filter += `&dir=${request.dir}`;
                
        this._httpClient.get(`${environment.api}/bls/sort?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.bls = response;
            this.onBlsListChanged.next(this.bls);
            resolve(this.bls);
          }, reject
        );        
      }
    );
  }
}
