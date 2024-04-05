import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {  TarifMss } from '../tarif-mss.model';
import {Departement} from "../../departement/departement.model";
import {Transporteur} from "../../transporteur/transporteur.model";

@Injectable({
  providedIn: 'root'
})
export class TarifMssDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onTarifMssDetailChanged: BehaviorSubject<any>;

  private currentId;

  constructor(private _httpClient: HttpClient) {
    this.onTarifMssDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

    this.editable = route.url[0].path === 'edit' ? true : false;
    this.currentId = Number(route.paramMap.get('id'));

    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(this.currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }

  getApiData(id: number): Promise<TarifMss[]> {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get(`${environment.api}/taxe/1`)
              .subscribe(

                  (response: TarifMss) => {
                    console.log(response)
                    this.rows = response;
                    this.onTarifMssDetailChanged.next(this.rows);
                    resolve(this.rows);
                  }, reject
              );
        }
    );
  }

  updateTarifMss(body): Observable<TarifMss> {
      console.log(body)
      console.log("n")
    return this._httpClient.post<TarifMss>(`${environment.api}/taxe/update`, body);
  }

  deleteTarifMss(id: number = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/taxe/delete/${id}`, requestOptions);
  }




}
