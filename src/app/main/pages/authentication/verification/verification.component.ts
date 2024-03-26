import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerificationComponent implements OnInit {

  // Public
  public coreConfig: any;
  public generetedCodeForm: UntypedFormGroup;
  public submitted = false;
  public error = '';
  public attmp = 0;

  public spinner: boolean = false;

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _coreConfigService: CoreConfigService, 
    private _formBuilder: UntypedFormBuilder,
    private _authenticationService: AuthenticationService,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  get f() {
    return this.generetedCodeForm.controls;
  }

  onSubmit() {
    this.submitted = true;   
    this.spinner = true;   

    if (this.generetedCodeForm.invalid) {
      console.log(this.generetedCodeForm);
      
      return;
    }

    let body = {
      secure: this.generetedCodeForm.value.code,
      username: this._authenticationService.currentUserValue.firstName
    }
      
    this._authenticationService.confirmEmailCode(body).subscribe(
      () => {
        this.spinner = false;   
            
        if (this._authenticationService.isClient) {
          this._router.navigate(['dashboard']);
        }else {
          this._router.navigate(['/']);
        }
      },
      err => {
        this.spinner = false;
        this.error = "Code incorrect"       
        if (this.attmp++ >= 2) {          
          this._authenticationService.logout();
          this._router.navigate(['/login']);
        }
      }
    )      
  }

  ngOnInit(): void {
    this.generetedCodeForm = this._formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(10)]]
    });

    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
