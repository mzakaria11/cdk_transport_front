import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Departement } from '../departement.model';

@Injectable({
  providedIn: 'root'
})
export class DepartementNewService implements Resolve<any> {

  public apiData: any;
  public onDepartementNewChanged: BehaviorSubject<any>;


  constructor(private _httpClient: HttpClient) {
    this.onDepartementNewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(): Promise<any[]> {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get('api/users-data')
              .subscribe(
                  (response: any) => {
                    this.apiData = response;
                    this.onDepartementNewChanged.next(this.apiData);
                    resolve(this.apiData);
                  }, reject
              );
        }
    );
  }

  addDepartement(body: any): Observable<Departement> {
      console.log(body);
    return this._httpClient.post<Departement>(`${environment.api}/departement`, body);

  }
}