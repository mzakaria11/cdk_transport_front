import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Article } from '../article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleDetailService implements Resolve<any> {

  public rows: any;
  public onArticleDetailChanged: BehaviorSubject<any>;

  public editable: boolean = false;

  private currentId;

  constructor(private _httpClient: HttpClient) {
    this.onArticleDetailChanged = new BehaviorSubject({});
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

  getApiData(id: number): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/articles/${id}`)
        .subscribe(
          (response: any) => {            
            this.rows = response;
            this.onArticleDetailChanged.next(this.rows);
            resolve(this.rows);
          }, reject
        );
      }
    );
  }

  updateArticle(body): Observable<Article> {
    return this._httpClient.post<Article>(`${environment.api}/articles/update`, body);
  }
  
  deleteArticle(id = this.currentId): Observable<String> {
    const requestOptions: Object = {
      responseType: 'text'
    };

    return this._httpClient.post<String>(`${environment.api}/articles/delete/${id}`, requestOptions);
  }
}
