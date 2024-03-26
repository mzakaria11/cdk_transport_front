import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DocumentService } from 'app/main/documents/document.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService implements Resolve<any> {
  
  private id: string;

  constructor(private _documentService: DocumentService) {} 

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    this.id = route.paramMap.get("bc");
    
    return new Promise<void>((resolve, reject) => {
      Promise.all([]).then(() => {
        resolve();
      }, reject);
    });  
  }

  download(type: string) {
    this._documentService.download(this.id, type)
    .subscribe(
      (blobData: Blob) => this._documentService.saveFile(blobData, "application/pdf", `${type}-${this.id}.pdf`)
    );
  }
}
