import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatArticleService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  fetchData(cmd?, article?) {    
    let params = cmd ? `cmd=${cmd}&` : '';
    params += article ? `article=${article}` : '';

    console.log(params);
    
    return this._httpClient.get(`${environment.api}/script/article-stat?${params}`);
  }
}
