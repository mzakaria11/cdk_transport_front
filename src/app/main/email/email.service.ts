import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { Email } from './email.model';
import { ArticleListService } from '../articles/article/article-list/article-list.service';
import { DestinataireListService } from '../destinataire/destinataire-list/destinataire-list.service';
import { environment } from 'environments/environment';


@Injectable()
export class EmailService implements Resolve<any> {
  // Public
  public emails: Email[];
  public selectedEmails: Email[];
  public openedEmail;
  public searchText = '';
  public composeEmailRef: boolean;
  public draftEmailsCount;
  public unReadInboxCount;
  public isEmailDetailOpen;
  public labelHandle;
  public folderHandle;

  public folders: any[];
  public labels: any[];
  public tempEmails: any[];

  public onEmailsChanged: BehaviorSubject<any>;
  public onSelectedEmailsChanged: BehaviorSubject<any>;
  public onOpenedEmailChanged: BehaviorSubject<any>;
  public onFoldersChanged: BehaviorSubject<any>;
  public onLabelsChanged: BehaviorSubject<any>;
  public composeEmailChanged: BehaviorSubject<boolean>;
  public onSearchTextChanged: BehaviorSubject<any>;
  public onDraftCountChanged: BehaviorSubject<any>;
  public onUnreadInboxCountChanged: BehaviorSubject<any>;
  public onEmailDetailChanged: BehaviorSubject<boolean>;

  // Private
  private routeParams: any;

  constructor(
    private _httpClient: HttpClient, 
    private router: Router, 
    private _destinataireListService: DestinataireListService, 
    private _articleListService: ArticleListService
  ) {
    this.folderHandle = 'inbox';
    this.labelHandle = '';
    this.selectedEmails = [];
    this.isEmailDetailOpen = false;
    this.onEmailsChanged = new BehaviorSubject([]);
    this.onSelectedEmailsChanged = new BehaviorSubject([]);
    this.onOpenedEmailChanged = new BehaviorSubject([]);
    this.onFoldersChanged = new BehaviorSubject([]);
    this.onLabelsChanged = new BehaviorSubject([]);
    this.composeEmailChanged = new BehaviorSubject(false);
    this.onSearchTextChanged = new BehaviorSubject('');
    this.onDraftCountChanged = new BehaviorSubject([]);
    this.onUnreadInboxCountChanged = new BehaviorSubject([]);
    this.onEmailDetailChanged = new BehaviorSubject(false);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.getEmails(),
        this._articleListService.getAllArticlesDataRows(),
        this._destinataireListService.getDestinatairesDataRows(),
      ]).then(() => {
        this.closeEmailDetails();
        this.deselectEmails();
        resolve();
      }, reject);
    });
  }

  getEmails() {
    return new Promise<void>(
      (resolve, reject) => {
        this._httpClient.get(`${environment.api}/email`)
        .subscribe(
          (response: any) => {           
            this.labelHandle = '';
            this.emails = response['data'];
            this.tempEmails = response['data'];
            this.onEmailsChanged.next(this.emails);
            resolve();
          }, reject
        );
      }
    );
  }


  composeEmail(value) {
    this.composeEmailRef = value;
    this.composeEmailChanged.next(this.composeEmailRef);
  }

  toggleSelectAll(): void {
    if (this.selectedEmails.length > 0) {
      this.deselectEmails();
    } else {
      this.selectEmails();
    }
  }

  selectEmails(): void {
    this.selectedEmails = JSON.parse(JSON.stringify(this.emails));
    this.onSelectedEmailsChanged.next(this.selectedEmails);
  }

  deselectEmails(): void {
    this.selectedEmails = [];

    this.onSelectedEmailsChanged.next(this.selectedEmails);
  }

  toggleSelectedMail(id): void {
    // First, check if we already have that Email as selected...
    if (this.selectedEmails.length > 0) {
      for (const email of this.selectedEmails) {
        // ...delete the unselected Email
        if (email.id === id) {
          const index = this.selectedEmails.indexOf(email);

          if (index !== -1) {
            this.selectedEmails.splice(index, 1);

            // Trigger the next event
            this.onSelectedEmailsChanged.next(this.selectedEmails);

            // Return
            return;
          }
        }
      }
    }

    // If we don't have it, push as selected
    this.selectedEmails.push(
      this.emails.find(email => {
        return email.id === id;
      })
    );

    // Trigger the next event
    this.onSelectedEmailsChanged.next(this.selectedEmails);
  }

  updateEmail(email): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post('api/emails-data/' + email.id, { ...email })
      .subscribe(
        response => {
          this.getEmails().then(
            emails => {
              resolve(emails);
            }, reject
          );
        }
      );
    });
  }

  setOpenedEmail(openedEmail) {
    this.selectedEmails = [];
    this.selectedEmails[0] = openedEmail;
    this.onSelectedEmailsChanged.next(this.selectedEmails);
  }

  openEmailDetails(id): void {
    this.openedEmail = this.emails.find(email => {
      return email.id === id;
    });
    this.onOpenedEmailChanged.next(this.openedEmail);
    }

  closeEmailDetails() {
    this.isEmailDetailOpen = false;
    this.onEmailDetailChanged.next(this.isEmailDetailOpen);
  }

  updateSearchText(value: string) {
    if (value !== undefined && value !== null) {
      this.searchText = value.toLowerCase();
      this.getMailOnQuery(value);
    }
  }

  getMailOnQuery(value) {
    console.log(this.tempEmails);
    
    
    const filteredMail = this.tempEmails.filter(email => {
      return email.subject.toLowerCase().includes(value)
      || email['destinataire'].adresselivraisonNom.toLowerCase().includes(value);
    });

    this.emails = filteredMail;
    this.onEmailsChanged.next(this.emails);
  }

  sendMail(): Observable<any> {
    return this._httpClient.post(`${environment.api}/email/currentcmd`, []);
  }

  compose(body: any): Promise<string> {
    const requestOptions: Object = {
      responseType: 'text'
    }

    return this._httpClient.post<string>(`${environment.api}/email/compose`, body, requestOptions).toPromise();
  }
}
