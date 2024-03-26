import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role, IRole } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUserSubject.value?.authenticated === true;
  }

  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value._roles.some(el => el['name'] === Role.Admin) ;
  }

  get isSuperAdmin() {
    return this.currentUser && this.currentUserSubject.value._roles.some(el => el['name'] === Role.SUPER_ADMIN) ;
  }

  get isClient() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Client;
  }

  get getRoles(): IRole[] {
    return (this.currentUser && this.currentUserSubject.value._roles) as any as IRole[];
  }

  login(username: string, password: string) {
    const header = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this._http
      .post<any>(`${environment.api}/login`, body.toString(),{ headers: header })
      .pipe(
        map(response => {
          let user = new User();
          
          if (response.user && response.user.access_token) {
            user.id = 1;
            user.firstName = response.user.username;
            user.token = response.user.access_token;
            user.refresh_token = response.user.refresh_token;
            
            let role = (response.user.roles as [])
              .find(
                ({name}) => {
                  return name === "Admin" || name == "User" || name == "Super_admin" || name == "Client"
                }
            );

            if (role) {
              user.role = role['name'];
            }

            user._roles = response.user.roles;
            user.avatar = 'avatar-s-11.jpg';
            user.authenticated = true;

            localStorage.setItem('currentUser', JSON.stringify(user));

            this.currentUserSubject.next(user);
          }

          return user;
        })
      );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  sendEmail(username: string): Observable<any> {
    return this._http.get(`${environment.api}/email/${username}`, { responseType: 'text' });
  }

  confirmEmailCode(body) {
    return this._http.post(`${environment.api}/confirm`, body, { responseType: 'text' }).pipe(
      map(
        () => {
          setTimeout(() => {
            this._toastrService.success(
              'Vous avez réussi à vous connecter en tant que ' +
                this.currentUserValue.role +
                ' de CrossDock. Maintenant vous pouvez commencer à explorer. Profitez-en !',
              '👋 Bienvenue, ' + this.currentUserValue.firstName + '!',
              { toastClass: 'toast ngx-toastr', closeButton: true }
            );
          }, 2500);
          return true;
        }
      )
    );
  }

  checkPassword(password: any): Observable<any> {
    const body = {
      username: this.currentUserSubject.value.firstName,
      password: password
    };

    return this._http.post(`${environment.api}/check`, body, { responseType: 'text' });
  }
}
