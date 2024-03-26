import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { LVE } from '../lve.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LettrevoitureentreNewService implements Resolve<any> {

  public rows: any;
  public onLVENewChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onLVENewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getLVEsDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getLVEsDataRows(): Promise<LVE[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/lve`)
        .subscribe(
          (response: LVE) => {            
            this.rows = response;
            this.onLVENewChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addLve(body: any): Observable<LVE> {
    return this._httpClient.post<LVE>(`${environment.api}/lve`, body);
  }

  uploadFile1(file: File): Observable<LVE> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<LVE>(`${environment.api}/lve/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
  }

  uploadFile(file: File): Observable<number | string> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const uploadUrl = `${environment.api}/upload`;

    return this._httpClient
      .post(uploadUrl, formData, {
        reportProgress: true,
        observe: 'events', 
        responseType: 'json',
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round((100 * event.loaded) / event.total);
            return progress;
          } else if (event.type === HttpEventType.Response) {
            return event.body;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('File upload error:', error);
          return throwError(error);
        })
    );
  }
}

