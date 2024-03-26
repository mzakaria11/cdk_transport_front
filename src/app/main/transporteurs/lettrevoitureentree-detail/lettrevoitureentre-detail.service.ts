import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { LVE } from '../lve.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LettrevoitureentreDetailService implements Resolve<any> {

  public rows: any;
  public editable: boolean = false;
  public onLVEDetailChanged: BehaviorSubject<any>;
  
  private currentId: number;

  constructor(private _httpClient: HttpClient) { 
    this.onLVEDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<LVE[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/lve/${id}`)
        .subscribe(
          (response: LVE) => {            
            this.rows = response;
            this.onLVEDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  getFile(filename: String): Observable<any> {
    return this._httpClient.get(`${environment.api}/lve/files/${filename}`, {responseType: 'arraybuffer'});
  }

  updateLve(body): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/lve/update`, body);
  }

  deleteLve(id: number = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<String>(`${environment.api}/lve/delete/${id}`, requestOptions);
  }

  uploadFile(formData: FormData): Observable<number | string> {
    const uploadUrl = `${environment.api}/lve/upload`;

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
