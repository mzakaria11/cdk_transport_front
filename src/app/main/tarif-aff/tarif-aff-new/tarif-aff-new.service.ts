import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType} from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import { environment } from 'environments/environment';
import {Departement} from "../../departement/departement.model";
import {Transporteur} from "../../transporteur/transporteur.model";
import {catchError, map} from "rxjs/operators";
import {TarifAff} from "../tarif-aff.model";

@Injectable({
    providedIn: 'root'
})
export class TarifAffNewService {
    public apiData: any;
    public onTarifAffNewChanged: BehaviorSubject<any>;

    constructor(private _httpClient: HttpClient) {
        this.onTarifAffNewChanged = new BehaviorSubject({});
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise<void>((resolve, reject) => {
            Promise.all([this.getApiData()]).then(() => {
                resolve();
            }, reject);
        });
    }

    getApiData(): Promise<any[]> {
        return new Promise(
            (resolve, reject) => {
                this._httpClient.get('api/users-data')
                    .subscribe(
                        (response: any) => {
                            this.apiData = response;
                            this.onTarifAffNewChanged.next(this.apiData);
                            resolve(this.apiData);
                        }, reject
                    );
            }
        );
    }

    getDepartements(): Observable<Departement[]> {

        var name =this._httpClient.get<Departement[]>(`${environment.api}/departement/all`);
        console.log(name)
        return name ;
    }

    getTransporteurs(): Observable<Transporteur[]> {
        return this._httpClient.get<Transporteur[]>(`${environment.api}/transporteurs/all`);
    }

    addTarifAff(body: any): Observable<TarifAff> {
        console.log(body);
        return this._httpClient.post<TarifAff>(`${environment.api}/tarifaff`, body);

    }



    //file part


    saveForm(body: any): Observable<any> {
        return this._httpClient.post<any>(`${environment.api}/form/add`, body);
    }


    uploadFile(formData: FormData , transporteurId : number): Observable<number | string> {
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











