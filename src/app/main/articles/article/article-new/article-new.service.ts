import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Article } from '../article.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleNewService implements Resolve<any> {

  public rows: any;
  public onArticleListChanged: BehaviorSubject<any>;
  
  constructor(private _httpClient: HttpClient) { 
    this.onArticleListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getArticlesDataRows()]).then(() => {
        resolve();
      }, reject);
    });  
  }

  getArticlesDataRows(): Promise<any[]>  {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/articles/all`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onArticleListChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  addArticle(body: any) {
    return this._httpClient.post(`${environment.api}/articles`, body);
  }
}
