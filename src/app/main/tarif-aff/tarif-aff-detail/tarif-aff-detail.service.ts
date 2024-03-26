import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {Departement} from "../../departement/departement.model";
import {Transporteur} from "../../transporteur/transporteur.model";
import {TarifAff} from "../tarif-aff.model";

@Injectable({
    providedIn: 'root'
})
export class TarifAffDetailService implements Resolve<any> {

    public rows: any;
    public editable: boolean = false;
    public onTarifAffDetailChanged: BehaviorSubject<any>;

    private currentId;

    constructor(private _httpClient: HttpClient) {
        this.onTarifAffDetailChanged = new BehaviorSubject({});
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

    getApiData(id: number): Promise<TarifAff[]> {
        return new Promise(
            (resolve, reject) => {
                this._httpClient.get(`${environment.api}/tarifaff/${id}`)
                    .subscribe(

                        (response: TarifAff) => {
                            console.log(response)
                            this.rows = response;
                            this.onTarifAffDetailChanged.next(this.rows);
                            resolve(this.rows);
                        }, reject
                    );
            }
        );
    }

    updateTarifAff(body): Observable<TarifAff> {
        console.log(body)
        console.log("n")
        return this._httpClient.post<TarifAff>(`${environment.api}/tarifaff/update`, body);
    }

    deleteTarifAff(id: number = this.currentId): Observable<String> {
        const requestOptions: Object = {
            responseType: 'text'
        };

        return this._httpClient.post<String>(`${environment.api}/tarifaff/delete/${id}`, requestOptions);
    }




}
