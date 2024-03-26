import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmailService } from '../email.service';
import { DestinataireListService } from 'app/main/destinataire/destinataire-list/destinataire-list.service';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { Email } from '../email.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-email-compose',
  templateUrl: './email-compose.component.html',
  encapsulation: ViewEncapsulation.None
})
export class EmailComposeComponent implements OnInit {

  // Decorator
  @HostListener('keydown.escape') fn() {
    this.closeCompose();
  }
  @ViewChild('selectRef') private _selectRef: any;

  // Public
  public emailToSelect: any[] = [];
  public emailReptureSelect: any[] = [];

  public emailBCCSelect = [
    { name: 'Jane Foster', avatar: 'assets/images/portrait/small/avatar-s-3.jpg' },
    { name: 'Donna Frank', avatar: 'assets/images/portrait/small/avatar-s-1.jpg' },
    { name: 'Gabrielle Robertson', avatar: 'assets/images/portrait/small/avatar-s-4.jpg' },
    { name: 'Lori Spears', avatar: 'assets/images/portrait/small/avatar-s-6.jpg' }
  ];

  public emailReptureSelected = [];
  public emailBCCSelected = [];
  public emailToSelected = [];

  public isOpenCC = false;
  public isOpenBCC = false;
  public isTousSelected = false;
  public mail: Email;
  public mailType: string;

  public isComposeOpen: boolean = false;

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _emailService: EmailService,
    private _destinataireListService: DestinataireListService,
    private _articleListService: ArticleListService
  ) {
    this.mail = {} as Email;
    this._unsubscribeAll = new Subject();
  }

  onItemSelect(event) {  
    if (this.mail.message == undefined )
      this.mail.message = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - " + event[event.length - 1] + " <br>"; 
    else
      this.mail.message += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - " + event[event.length - 1] + "<br>";
  }

  clearSelectedEmail(item) {
    this.emailToSelected = this.emailToSelected.filter(el => { return  el !== item.email});   
  }

  clearSelectedArticle(item) {
    this.emailReptureSelected = this.emailReptureSelected.filter(el => { return  el !== item.name});
    this.mail.message = this.mail.message.replace("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - " + item.name + '<br>', '');
  }

  togglCcBcc(toggleRef) {
    if (toggleRef == 'cc') {
      this.isOpenCC = !this.isOpenCC;
      this.mailType = this.isOpenCC ? "artRup" : '';
      this.mail.subject = "";
    } else {
      this.isOpenBCC = !this.isOpenBCC;
      this.mailType = this.isOpenBCC ? "currCmd" : '';
      this.mail.subject = this.isOpenBCC ? "Articles commandés qui ne seront pas livrés en intégralité" : '';
    }
  }

  closeCompose() {
    this.isComposeOpen = false;
    this._emailService.composeEmail(this.isComposeOpen);
  }

  envoyerMail() {   
    if (this.mailType == "artRup") {
      this.mail.rep = this.emailReptureSelected;
      this.mail.to = this.emailToSelected.includes("tous") ? this.emailToSelect.map(e => e.email) : this.emailToSelected;
      this.mail.time = new Date().toLocaleDateString();
      console.log(this.mail);
      
      // this._emailService.compose(this.mail).then(
      //   response => {
      //     console.log(response);
      //     Swal.fire(
      //       {
      //         position: 'top-end',
      //         icon: 'success',
      //         title: 'Email envoyé!',
      //         showConfirmButton: false,
      //         timer: 1500
      //       }
      //     ).then(
      //       () => {
      //         this._emailService.getEmails();
      //         this.closeCompose();
      //       }
      //     )
      //   }
      // )
    }
  }

  ngOnInit(): void {

    this._destinataireListService.onDestinataireListChanged.pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.emailToSelect = response.data;
        this.emailToSelect.unshift({email: 'tous', codeUM: 'Tous', adresselivraisonNom: 'Tous'})
      }
    );

    // this._articleListService.onArticleListChanged.pipe(takeUntil(this._unsubscribeAll))
    // .subscribe(
    //   response => {        
    //     this.emailReptureSelect = response;
    //   }
    // );

    this._articleListService.getAllArticlesDataRows()
    .then(
      (response) => {
        try {         
          response.forEach(
            (el) => {
              const code = el.codeClient;
              const name = code + ' | ' + el.designationClient;
              const id = el.id;
              this.emailReptureSelect = [...this.emailReptureSelect, { name, code, id }];
              
            }
          );          
          console.log(this.emailReptureSelect);
        } catch (error) {
          console.error('Error while processing the response:', error);
        }
      }
    )
    .catch(
      (error) => {
        console.error('Error fetching articles:', error);
      }
    );  

    this._emailService.composeEmailChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.isComposeOpen = response;
      if (this.isComposeOpen) {
        setTimeout(() => {
          this._selectRef.searchInput.nativeElement.focus();
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
