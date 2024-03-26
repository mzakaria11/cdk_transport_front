import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PreventLogsInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to remove the default logging interceptor
    const newReq = req.clone({
      headers: req.headers.set('X-Requested-With', 'XMLHttpRequest')
    });

    // Call the next interceptor or the final HttpClient request
    return next.handle(newReq);
  }
}
