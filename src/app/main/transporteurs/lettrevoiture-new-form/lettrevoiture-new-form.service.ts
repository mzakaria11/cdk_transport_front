import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LettrevoitureNewFormService implements Resolve<any> {

  public rows: any;
  public onLVENewChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onLVENewChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([]).then(() => {
        resolve();
      }, reject);
    });  
  }

  saveForm(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/form/add`, body);
  }

  uploadFile(formData: FormData): Observable<number | string> {
    const uploadUrl = `${environment.api}/form/upload`;

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

  checkFiles(location: string, file: string): Observable<any> {
    return this._httpClient.get(`${environment.api}/${location}/file/${file}`);
  }
}