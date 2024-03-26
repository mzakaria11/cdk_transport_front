import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Departement } from '../departement.model';

@Injectable({
  providedIn: 'root'
})
export class DepartementListService implements Resolve<any> {

  public rows: any;
  public onDepartementListChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onDepartementListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDepartementDataRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getDepartementDataRows(): Promise<any[]>  {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get(`${environment.api}/departement?page=0&size=20`)
              .subscribe(
                  (response: any) => {
                    this.rows = response;
                    console.log(response);
                    this.onDepartementListChanged.next(this.rows);
                    resolve(this.rows);
                  }, reject
              );
        }
    );
  }

  getDepartement(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${environment.api}/departement`);
  }
}
