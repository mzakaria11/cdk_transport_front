import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { APiResponse } from 'app/api-response';
import { ArticleRequest } from '../article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleListService implements Resolve<any> {

  public articles: any;
  public onArticleListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onArticleListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getArticlesDataRows(new ArticleRequest())]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getArticlesDataRows(request: ArticleRequest = new ArticleRequest()): Promise<APiResponse>  {
    return new Promise(
      (resolve, reject) => {               
        let filter: string = `page=${request.page.offset}&size=${request.page.size}`;

        filter += request.article ? `&article=${request.article}` : '';
        filter += request.operation ? `&operation=${request.operation}&qte=${request.qte}` : '';
        filter += request.stock ? `&stock=${request.stock}` : '';
        filter += request.fournisseur ? `&fournisseur=${request.fournisseur}` : '';
        filter += request.sort ? request.sort : '';
        
        this._httpClient.get(`${environment.api}/articles?${filter}`)
        .subscribe(
          (response: APiResponse) => {            
            this.articles = response;
            this.onArticleListChanged.next(this.articles);
            resolve(this.articles);
          }, reject
        );        
      }
    );
  }

  getAllArticlesDataRows(): Promise<any>  {
    return new Promise(
      (resolve, reject) => {               
        this._httpClient.get(`${environment.api}/articles/all`)
        .subscribe(
          (response: any) => {      
            this.articles = response;
            this.onArticleListChanged.next(this.articles);      
            resolve(response);
          }, reject
        );        
      }
    );
  }

  getArticleByFournisseur(idFournisseur: number): Promise<APiResponse> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/articles/fournisseur/${idFournisseur}?page=0&size=100`)
        .subscribe(
          (response: APiResponse) => {            
            this.articles = response;
            this.onArticleListChanged.next(this.articles);
            resolve(this.articles);
          }, reject
        );
      }
    );
  }
  exportToExcel(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return this._httpClient.get(`${environment.api}/documents/articles-stock`, {
      headers: headers,
      responseType: 'blob'
    });  
  }
}
