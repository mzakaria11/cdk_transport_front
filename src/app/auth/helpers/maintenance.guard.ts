import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {
  private inMaintenanceMode = false;

  constructor (private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {    
    if (this.inMaintenanceMode) {
      if (state.url !== '/miscellaneous/maintenance') {
        this.router.navigate(['/miscellaneous/maintenance']);
      }

      return false;
    }
    return true;
  }

}
