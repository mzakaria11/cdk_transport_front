import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TarifMss } from '../tarif-mss.model';
import {data} from "autoprefixer";

@Injectable({
    providedIn: 'root'
})
export class TarifMssListService implements Resolve<any> {

    public rows: any;
    public onTarifMssListChanged: BehaviorSubject<any>;

    constructor(private _httpClient: HttpClient) {
        this.onTarifMssListChanged = new BehaviorSubject({});
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
        return new Promise<void>((resolve, reject) => {
            Promise.all([this.getTarifMsssDataRows()]).then(() => {
                resolve();
            }, reject);
        });
    }

    getTarifMsssDataRows(): Promise<any[]>  {
        return new Promise(
            (resolve, reject) => {
                this._httpClient.get(`${environment.api}/tarifmss`)
                    .subscribe(
                        (response: any) => {
                            this.rows = response;
                            this.onTarifMssListChanged.next(this.rows);
                            resolve(this.rows);
                        }, reject
                    );
            }
        );
    }

    getTarifMss(): Observable<TarifMss[]> {
        return this._httpClient.get<TarifMss[]>(`${environment.api}/tarifmss`);
    }




    chooseTransporteur(id: number){
        return this._httpClient.get<any>(`http://localhost:8080/api/tarifmss/list/${id}`)
    }


    // fetchTarifMssData(transporteurId: number) {
    //     this.http.get<any>(`http://localhost:8080/api/tarifmss/list/${transporteurId}`).subscribe(data => {
    //
    //     }
    //     this.rows = data.departements.map(departement => {
    //         const row: any = {
    //             departementName: departement.departementName,
    //             departementId: departement.departementId
    //         };
    //     }}
}
