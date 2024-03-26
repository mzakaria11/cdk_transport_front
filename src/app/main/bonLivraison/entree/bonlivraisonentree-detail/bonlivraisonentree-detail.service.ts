import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { BLE } from '../ble.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BonlivraisonentreeDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onBLEDetailChanged: BehaviorSubject<any>;
  
  private currentId: number;

  constructor(
    private _httpClient: HttpClient
  ) { 
    this.onBLEDetailChanged = new BehaviorSubject({});
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


  getApiData(id: number): Promise<BLE[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ble/${id}`)
        .subscribe(
          (response: BLE) => {            
            this.rows = response;
            this.onBLEDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  updateBle(body): Observable<BLE> {
    return this._httpClient.post<BLE>(`${environment.api}/ble/update`, body);
  }
  
  deleteBle(id: number = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<String>(`${environment.api}/ble/delete/${id}`, requestOptions);
  }

  getFile(filename: String): Observable<any> {
    return this._httpClient.get(`${environment.api}/ble/files/${filename}`, {responseType: 'arraybuffer'});
  }

  syncLigne(ume, ligne): Promise<string> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<string>(`${environment.api}/ligneble/update/${ume}/${ligne}`, requestOptions).toPromise();
  }

  uploadFile(formData: FormData): Observable<number | string> {
    const uploadUrl = `${environment.api}/ble/upload`;

    return this._httpClient
      .post(uploadUrl, formData, {
        reportProgress: true,
        observe: 'events', 
        responseType: 'json',
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.Response) {
            return event.body;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('File upload error:', error);
          return throwError(error);
        }
      )
    );
  }
}
