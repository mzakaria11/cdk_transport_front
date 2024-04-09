import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {  Taxe } from '../taxe.model';
import {Departement} from "../../departement/departement.model";
import {Transporteur} from "../../transporteur/transporteur.model";
@Injectable({
  providedIn: 'root'
})
export class TaxeDetailService implements Resolve<any> {



  public rows: any;
  public editable: boolean = false;
  public onTaxeDetailChanged: BehaviorSubject<any>;

  private currentId;

  constructor(private _httpClient: HttpClient) {
    this.onTaxeDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<Taxe[]> {
    return new Promise(
        (resolve, reject) => {
          this._httpClient.get(`${environment.api}/taxe/${id}`)
              .subscribe(

                  (response: Taxe) => {
                    console.log(response)
                    this.rows = response;
                    this.onTaxeDetailChanged.next(this.rows);
                    resolve(this.rows);
                  }, reject
              );
        }
    );
  }

  updateTaxe(body): Observable<Taxe> {
    console.log(body)
    console.log("n")
    return this._httpClient.post<Taxe>(`${environment.api}/taxe/update`, body);
  }

  deleteTaxe(id: number = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/taxe/delete/${id}`, requestOptions);
  }






}
