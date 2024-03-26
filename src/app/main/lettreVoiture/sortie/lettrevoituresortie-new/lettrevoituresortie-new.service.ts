import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LettrevoituresortieNewService implements Resolve<any> {

  public rows: any;
  public onLVSNewChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onLVSNewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getLVSsDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getLVSsDataRows(): Promise<any[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/lvs`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onLVSNewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }
}

