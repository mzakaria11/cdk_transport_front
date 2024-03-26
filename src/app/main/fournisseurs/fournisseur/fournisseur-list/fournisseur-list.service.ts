import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Fournisseur } from '../fournisseur.model';

@Injectable({
  providedIn: 'root'
})
export class FournisseurListService implements Resolve<any>{
  public rows: any;
  public onFournisseurListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onFournisseurListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getFournisseursDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getFournisseursDataRows(): Promise<any[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/fournisseurs`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onFournisseurListChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  getFournisseur(): Observable<Fournisseur[]> {
    return this._httpClient.get<Fournisseur[]>(`${environment.api}/fournisseurs`);
  }

  addFournisseur(body: Fournisseur): Observable<Fournisseur> {
    return this._httpClient.post<Fournisseur>(`${environment.api}/fournisseurs`, body);
  }

  deleteArticle(id: number): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.delete<String>(`${environment.api}/fournisseurs/${id}`, requestOptions);
  }
}
