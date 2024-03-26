import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { RepartitionRequest } from '../repartition.model';
import { BoncommandsortieListService } from 'app/main/bonCommand/sortie/boncommandsortie-list/boncommandsortie-list.service';

@Injectable({
  providedIn: 'root'
})
export class RepartitionListService implements Resolve<any> {

  public repartitions: any;
  public repsInProcess: any;
  public onRepartitionChanged: BehaviorSubject<any>;
  public onRepInProcessChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onRepartitionChanged = new BehaviorSubject({});
    this.onRepInProcessChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getRepartitionDataRows(new RepartitionRequest()), this.getRepInProcessDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getRepartitionDataRows(request: RepartitionRequest = new RepartitionRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.destinataire ? `&destinataire=${request.destinataire}` : '';
        filter += request.dir ? `&dir=${request.dir}` : '';

        if (!request.dir) {
          filter += request.sort ? request.sort : '&sort=idBonCommandeSortie,Desc';
        }
                
        this._httpClient.get(`${environment.api}/bcs/imported?${filter}`)
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

  getRepInProcessDataRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environment.api}/script/inprocess`).subscribe((response: any) => {
        this.repsInProcess = response;
        this.onRepInProcessChanged.next(this.repsInProcess);
        resolve(this.repsInProcess);
      }, reject);
    });
  }

  startScript(): Observable<any> {
    return this._httpClient.get(`${environment.api}/script/repartir`);
  }


}
