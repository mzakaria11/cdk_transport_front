import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LVE, LveRequest } from '../lve.model';
import { APiResponse } from 'app/api-response';

@Injectable({
  providedIn: 'root'
})
export class LettrevoitureentreListService implements Resolve<any> {

  public lves: any;
  public onLVEListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onLVEListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getLvesDataRows(new LveRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getLvesDataRows(request: LveRequest = new LveRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.transporteur ? `&transporteur=${request.transporteur}` : '';
        filter += request.operationPalette ? `&operationPalette=${request.operationPalette}&qtePalette=${request.qtePalette}` : '';
        filter += request.operationColis ? `&operationColis=${request.operationColis}&qteColis=${request.qteColis}` : '';
        filter += request.dateReceptionDebut ? `&dateReceptionDebut=${request.dateReceptionDebut}` : '';
        filter += request.dateReceptionFin ? `&dateReceptionFin=${request.dateReceptionFin}` : '';
        filter += request.sort ? request.sort : '&sort=idLettreVoitureEntree,desc';
                
        this._httpClient.get(`${environment.api}/lve/test?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.lves = response;
            this.onLVEListChanged.next(this.lves);
            resolve(this.lves);
          }, reject
        );        
      }
    );
  }
}

