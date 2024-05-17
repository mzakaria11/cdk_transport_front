import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, UrlTree } from '@angular/router';

import { AuthenticationService } from 'app/auth/service';
import { Observable } from 'rxjs';
import { IRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._authenticationService.currentUserValue;
    
    if (currentUser) {      
      const roles = (currentUser._roles as any as IRole[]).map(({name}) => name);
      console.log("route.data.roles auth guard",route.data.roles);

      if (route.data.roles?.length > 0 && !route.data.roles.some(role => roles.includes(role))) {
        return this._router.parseUrl('/pages/miscellaneous/not-authorized');
      }
                      
      return true;
    }

    this._router.navigate(['login']);
    return false;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    return this.canActivate(next, state);
  }
}
