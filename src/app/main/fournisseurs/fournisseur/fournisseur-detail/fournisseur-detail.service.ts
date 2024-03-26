import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Fournisseur } from '../fournisseur.model';

@Injectable({
  providedIn: 'root'
})
export class FournisseurDetailService implements Resolve<any>{

  public rows: any;
  public onFournisseurDetailChanged: BehaviorSubject<any>;
  public editable: boolean = false;

  private currentId: number;

  constructor(private _httpClient: HttpClient) {
    this.onFournisseurDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/fournisseurs/${id}`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onFournisseurDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  updateFournisseur(body): Observable<Fournisseur> {
    return this._httpClient.put<Fournisseur>(`${environment.api}/fournisseurs`, body);
  }
  
  deleteFournisseur(): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/fournisseurs/delete/${this.currentId}`, requestOptions);
  }
}
