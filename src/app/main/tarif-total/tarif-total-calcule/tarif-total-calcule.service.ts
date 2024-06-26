import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TarifTotalCalculeService {

  constructor(private http: HttpClient) { }


  private tariffData = new BehaviorSubject<any[]>([]);

  setTariffData(data: any[]) {
    this.tariffData.next(data);
  }

  getTariffData(): Observable<any[]> {
    return this.tariffData.asObservable();
  }
  getTariffDataByDate(unixDate: number, page: number, size: number): Observable<any> {
    const url = `${environment.api}/tariffs/input?unixDate=${unixDate/1000}&page=${page}&size=${size}`;
    return this.http.get<any>(url);
  }




}