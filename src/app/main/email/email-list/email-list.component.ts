import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { Email } from '../email.model';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class EmailListComponent implements OnInit {
  // Public
  public emails: Email[];
  public hasSelectedMails;
  public isIndeterminate;

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(private _emailService: EmailService, private _coreSidebarService: CoreSidebarService) {
    this._unsubscribeAll = new Subject();
  }

  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  toggleSelectAll() {
    this._emailService.toggleSelectAll();
  }

  openEmail(id) {
    this._emailService.openEmailDetails(id);
  }

  queryUpdate(queryValue) {
    console.log(queryValue);
    
    this._emailService.updateSearchText(queryValue.target.value);
  }

  ngOnInit(): void {
    // Subscribe to Selected Emails changes
    this._emailService.onSelectedEmailsChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(selectedMails => {
      setTimeout(() => {
        this.hasSelectedMails = selectedMails.length > 0;
        this.isIndeterminate = selectedMails.length !== this._emailService.emails.length && selectedMails.length > 0;
      }, 0);
    });

    // Subscribe to update Emails on changes
    this._emailService.onEmailsChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(emails => {
      this.emails = emails;      
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
