import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private _httpClient: HttpClient) {}

  generatePdf(type: string, ts: number): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/pdf' });
    
    return this._httpClient.get<Blob>(`${environment.api}/documents/${type}/${ts}`, {
      headers: headers,
      responseType: 'blob' as 'json' 
    });
  }

  stockArticles(): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/pdf' });
    
    return this._httpClient.get<Blob>(`${environment.api}/documents/stock-articles`, {
      headers: headers,
      responseType: 'blob' as 'json' 
    });
  }

  generatePdfById(type: string, id: number): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/pdf' });

    return this._httpClient.get<Blob>(`${environment.api}/documents/${type}/${id}`, {
      headers: headers,
      responseType: 'blob' as 'json' 
    });
  }

  generateUmsTicket(type: string, ids: number[]): Observable<HttpResponse<Blob>> {
    return this._httpClient.post<Blob>(
      `${environment.api}/documents/${type}`, 
      ids, 
      { observe: 'response', responseType: 'blob' as 'json' }
    );
  }

  generateBlsPdf(type: string, ids: number[]): Observable<HttpResponse<Blob>> {
    return this._httpClient.post<Blob>(
      `${environment.api}/documents/${type}`, 
      ids, 
      { observe: 'response', responseType: 'blob' as 'json' }
    );
  }

  generateVolumeExcel(ts: number): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return this._httpClient.get(`${environment.api}/documents/volume/${ts}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  saveFile(blobData: Blob, type: string, name: string): void {
    const blob = new Blob([blobData], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  openFile(blobData: Blob): void {      
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const newTab = window.open();
    newTab.location.href = url;
  }

  getFilenameFromResponse(response: HttpResponse<any>): string | null {
    console.log(response.headers);
    const contentDispositionHeader = response.headers.get('Content-Disposition');
    
    if (contentDispositionHeader) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDispositionHeader);
      if (matches != null && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }

    return null;
  }

  generateQRCode(text: string, size: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const params = new HttpParams()
      .set('text', text)
      .set('size', size.toString());

    return this._httpClient.get(`${environment.api}/documents/qr`, {
      headers: headers,
      params: params,
      responseType: 'blob'
    });
  }

  download(bc: string, type?: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this._httpClient.get(`http://localhost:8080/api/media/download-pdf/${bc},${type}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

}
