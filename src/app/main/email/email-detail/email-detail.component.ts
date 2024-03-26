import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Email } from '../email.model';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-email-details',
  templateUrl: './email-detail.component.html',
  encapsulation: ViewEncapsulation.None
})
export class EmailDetailsComponent implements OnInit {

  public openedEmail: Email;
  public isOpen = false;

  private _unsubscribeAll: Subject<any>;

  constructor(private _emailService: EmailService) {
    this._unsubscribeAll = new Subject();
  }

  toggleDetails() {
    this._emailService.closeEmailDetails();
    this._emailService.deselectEmails();
  }

  ngOnInit(): void {
    this._emailService.onEmailDetailChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      setTimeout(() => {
        this.isOpen = response;
      });
    });

    this._emailService.onOpenedEmailChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(email => {
      this.openedEmail = email;
      if (Object.keys(this.openedEmail).length > 0) {
        this.isOpen = true;
        this._emailService.setOpenedEmail(this.openedEmail);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
