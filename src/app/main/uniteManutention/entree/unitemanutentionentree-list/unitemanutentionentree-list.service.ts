import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { UmeRequest } from '../ume.model';

@Injectable({
  providedIn: 'root'
})
export class UnitemanutentionentreeListService implements Resolve<any> {
 
  public umes: any;
  public onUmeListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onUmeListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getUmesDataRows(new UmeRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getUmesDataRows(request: UmeRequest = new UmeRequest()): Promise<any>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        if (request.idUme ) {
          filter +=  `&idUme=${request.idUme}`;
        } else if (request.colis) {
          filter += `&colis=${request.colis}`;
        } else {
          filter += request.article ? `&article=${request.article}` : '';
          filter += request.zone ? `&zone=${request.zone}` : '';
          filter += request.ble ? `&ble=${request.ble}` : '';
          filter += request.numeroLot ? `&lot=${request.numeroLot}` : '';
          filter += request.dateStartP ? `&dateStartP=${request.dateStartP}` : '';
          filter += request.dateEndP ? `&dateEndP=${request.dateEndP}` : '';
          filter += request.dateStartR ? `&dateStartR=${request.dateStartR}` : '';
          filter += request.dateEndR ? `&dateEndR=${request.dateEndR}` : '';
          filter += request.operation ? `&operation=${request.operation}&qte=${request.qte}` : '';
        }

        filter += request.sort ? request.sort : '&sort=u.idUniteManutentionEntree,Desc';
               
        this._httpClient.get(`${environment.api}/ume?${filter}`)
        .subscribe(
          (response: any) => {            
            this.umes = response;
            this.onUmeListChanged.next(this.umes);
            resolve(this.umes);
          }, reject
        );        
      }
    );
  }

  exportToExcel(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return this._httpClient.get(`${environment.api}/documents/ume/stock`, {
      headers: headers,
      responseType: 'blob'
    });
  }
}
  