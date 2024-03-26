import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from 'app/auth/service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {        
        if ([405].indexOf(err.status) !== -1) {
          
          this._router.navigate(['/miscellaneous/not-authorized']);

          // this._authenticationService.logout();
          // location.reload(true);
        } else if ([403].indexOf(err.status) !== -1) {
          // this._router.navigate(['/miscellaneous/error']);
        }
        
        return throwError(err);
      })
    );
  }
}
