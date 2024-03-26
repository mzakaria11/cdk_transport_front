import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { AuthenticationService } from 'app/auth/service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-login-v1',
  templateUrl: './auth-login-v1.component.html',
  styleUrls: ['./auth-login-v1.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthLoginV1Component implements OnInit {

  //  Public
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public passwordTextType: boolean;
  public loading = false;
  public error = '';
  public returnUrl: string;

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _coreConfigService: CoreConfigService, 
    private _formBuilder: UntypedFormBuilder, 
    private _authenticationService: AuthenticationService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this._authenticationService
    .login(this.f.username.value, this.f.password.value)
    .pipe(first())
    .subscribe(
      () => {                          
        this.error = null;
        this._authenticationService.sendEmail(this.f.username.value).subscribe(
          () => {
            this._router.navigate(['/login/check']);
          }
        )
      },
      ({error}) => {   
        console.log(error);
            
        this.error = error.errors.login;        
        this.loading = false;
      }
    );
  }


  ngOnInit(): void {
    this.loginForm = this._formBuilder.group(
      {
        username: ['', [Validators.required]],
        password: ['', Validators.required]
      }
    );

    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';    

    this._coreConfigService.config
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      config => {
        this.coreConfig = config;
      }
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
