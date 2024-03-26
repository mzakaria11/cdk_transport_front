import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { BleRequest } from '../ble.model';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonentreeListService implements Resolve<any> {

  public bles: any;
  public onBleListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onBleListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBlesDataRows(new BleRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBlesDataRows(request: BleRequest = new BleRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.numeroBl ? `&numeroBl=${request.numeroBl}` : '';
        filter += request.operation ? `&operation=${request.operation}&qte=${request.qtePalette}` : '';
        filter += request.qtePalette ? `&qtePalette=${request.qtePalette}` : '';
        filter += request.fournisseur ? `&fournisseur=${request.fournisseur}` : '';
        filter += request.lve ? `&lve=${request.lve}` : '';
        filter += request.dateReceptionDebut ? `&dateReceptionDebut=${request.dateReceptionDebut}` : '';
        filter += request.dateReceptionFin ? `&dateReceptionFin=${request.dateReceptionFin}` : '';
        filter += request.sort ? request.sort : '&sort=idBonLivraisonEntree,desc';
                
        this._httpClient.get(`${environment.api}/ble?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.bles = response;
            this.onBleListChanged.next(this.bles);
            resolve(this.bles);
          }, reject
        );        
      }
    );
  }

  sync(body): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ble/sync`, body);
  }

  syncLigne(body): Promise<string> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<string>(`${environment.api}/ligneble/add`, body, requestOptions).toPromise();
  }

  getArticle(code): Promise<any> {
    return this._httpClient.get<any>(`${environment.api}/articles/code/${code}`).toPromise();
  }

}
