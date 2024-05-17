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
export class RepartitionHistoryService implements Resolve<any> {

  public repartitions: any;
  public repsInProcess: any;
  public onRepartitionHistoryChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onRepartitionHistoryChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getRepartitionHistoryDataRows(new RepartitionRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getRepartitionHistoryDataRows(request: RepartitionRequest = new RepartitionRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${( request.page.size + 100 )}`;
                
        console.log(request.page.size);
        console.log(filter);
        
        this._httpClient.get(`${environment.api}/script/history?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.repartitions = response;
            this.onRepartitionHistoryChanged.next(this.repartitions);
            resolve(this.repartitions);
          }, reject
        );        
      }
    );
  }




    getGroupedConfirmedData() {
        return this._httpClient.get(`${environment.api}/grouped/confirmed`).toPromise();
    }

}