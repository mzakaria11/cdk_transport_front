import { DOCUMENT } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmailService } from './email.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'email-application' }
})
export class EmailComponent {
  public openComposeRef;

  constructor(
    @Inject(DOCUMENT) private document, 
    private route: ActivatedRoute, 
    private _emailService: EmailService
  ) {}

  openCompose() {
    this.openComposeRef = true;
    this._emailService.composeEmail(this.openComposeRef);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(val => {
      this._emailService.updateSearchText(val.q);
    });
  }
}
