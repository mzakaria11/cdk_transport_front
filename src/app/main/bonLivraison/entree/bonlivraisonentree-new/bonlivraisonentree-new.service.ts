import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BLE, LigneBle } from '../ble.model';
import { LettrevoitureentreDetailService } from 'app/main/lettreVoiture/entree/lettrevoitureentree-detail/lettrevoitureentre-detail.service';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonentreeNewService implements Resolve<any> {

  public rows: any;
  public onBLENewChanged: BehaviorSubject<any>;
  
  constructor(
    private _httpClient: HttpClient, 
    private _detailLveService: LettrevoitureentreDetailService,
    private _listFournisseurService: FournisseurListService
  ) { 
    this.onBLENewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    let lveId = Number(route.paramMap.get('id'));

    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getBLEsDataRows(), this._listFournisseurService.getFournisseursDataRows(), this._detailLveService.getApiData(lveId)]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getBLEsDataRows(): Promise<BLE[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ble`)
        .subscribe(
          (response: BLE) => {            
            this.rows = response;
            this.onBLENewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addBle(body: any): Observable<BLE> {
    return this._httpClient.post<BLE>(`${environment.api}/ble`, body);
  }

  addLigneBle(body: any): Observable<LigneBle> {
    return this._httpClient.post<LigneBle>(`${environment.api}/ligneble`, body);
  }

  uploadFile(file: File): Observable<BLE> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<BLE>(`${environment.api}/ble/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
  }
}

