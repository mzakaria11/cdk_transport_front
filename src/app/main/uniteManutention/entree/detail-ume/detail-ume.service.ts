import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { ColisRequest, UME } from '../ume.model';

@Injectable({
  providedIn: 'root'
})
export class DetailUmeService implements Resolve<any> {

  public ume: UME;
  public onUMEDetailChanged: BehaviorSubject<any>;
  public onColisDetailChanged: BehaviorSubject<any>;
  public editable: boolean = false;

  private id: number;

  constructor (private _httpClient: HttpClient) {
    this.onUMEDetailChanged = new BehaviorSubject({});
    this.onColisDetailChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = Number(route.paramMap.get('id'));
    this.editable = route.url[0].path === 'edit' ? true : false;

    return new Promise<void>(
      (resolve, reject) => {
        Promise.all(
          [
            this.getUMEApiData(),
            this.getColisDataRows(new ColisRequest())
          ]
        ).then(
          () => {
            resolve();
          }, reject
        );
      }
    );
  }

  getUMEApiData(): Promise<UME> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/ume/${this.id}`)
          .subscribe(
            async (response: UME) => {
              this.ume = response;
              this.onUMEDetailChanged.next(this.ume);
              resolve(this.ume);
            }, reject
          );
      }
    );
  }

  getColisDataRows(request: ColisRequest = new ColisRequest()): Promise<APiResponse> {
    return new Promise(
      (resolve, reject) => {
        let filter: string = `page=${request.page.offset}&size=${request.page.size}&idUme=${this.id}`;

        filter += request.idDestinataire ? `&idDestinataire=${request.idDestinataire}` : '';
        filter += request.colis ? `&colis=${request.colis}` : '';
        filter += request.stock ? `&stock=${request.stock}` : '&stock=asigne';

        this._httpClient.get(`${environment.api}/colis?${filter}`)
          .subscribe(
            (response: APiResponse) => {
              this.onColisDetailChanged.next(response);
              resolve(response);
            }, reject
          );
      }
    );
  }

  updateEmplacement(body: any, destinataire): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/ume/emplacementenmass/${this.id},d=${destinataire}`, body);
  }

  printLabel(idUme, zpl, stat, destinataire, body): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/print-label/u=${idUme},z=${zpl},d=${destinataire},s=${stat}`, body);
  }

  qrCode(idUme, stat, destinataire, body): Observable<any> {
    // const headers = new HttpHeaders({ 'Content-Type': 'application/pdf' });

    return this._httpClient.post(`${environment.api}/ume/generate-qr-code/u=${idUme},d=${destinataire},s=${stat}`, body, {
      // headers: headers,
      responseType: 'blob' as 'json'
    });
  }

  qrCodeByColis(id): Observable<any> {
    return this._httpClient.get(`${environment.api}/ume/generate-qr-code/c=${id}`, {
      responseType: 'blob' as 'json'
    });
  }

  printLabelByColis(id, zpl): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/print-label/colis/${id},z=${zpl}`, {});
  }

  printEtiquette(idUme, stat, body): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/netiquette/${stat}/${idUme}`, body);
  }

  printZplEtiquette(idUme, stat, z, body): Observable<any> {
    return this._httpClient.post(`${environment.api}/ume/zpl/${stat}/${idUme},${z}`, body);
  }

  printByColis(id: number): Observable<any> {
    return this._httpClient.get(`${environment.api}/ume/print/colis/${id}`);
  }

  delete(): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.delete<String>(`${environment.api}/ume/delete/${this.id}`, requestOptions);
  }

  update(body): Observable<UME> {
    return this._httpClient.post<UME>(`${environment.api}/ume/update`, body);
  }

  updateAll(f: { lot?: string, date?: number }): Observable<UME> {
    let url = f.lot ? `/l=${f.lot}` : '';
    url += f.date ? `/d=${f.date}` : '';

    return this._httpClient.post<UME>(`${environment.api}/colis/update/ume=${this.id}${url}`, {});
  }

  updateColis(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/colis/emplacement`, body);
  }

  repartition(body: any): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/script/rep/${this.id}`, body);
  }

  addColis(idUme: number, qte: number): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/colis/duplicate/${idUme},qte=${qte}`, []);
  }

  deleteColis(idColis: number): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/colis/delete/${idColis}`, requestOptions);
  }

  delierColis(id: number): Observable<any> {
    return this._httpClient.post<any>(`${environment.api}/colis/delier/${id}`, []);
  }
}
