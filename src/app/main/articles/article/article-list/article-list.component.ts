import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Article, ArticleRequest } from '../article.model';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { ArticleDetailService } from '../article-detail/article-detail.service';
import { ArticleListService } from './article-list.service';
import { takeUntil } from 'rxjs/operators';
import { DocumentService } from 'app/main/documents/document.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleListComponent implements OnInit {

  //#region VARIABLES

  public hasRole: String[] = [];
  public contentHeader: Object;

  public currentPageLimit: number = 25;
  
  public readonly pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
    { value: 500 },
  ];
  public stock: any[] = [
    { name: 'Tous', id: null },
    { name: 'En stock', id: 'in' },
    { name: 'En rupture', id: 'out' }
  ];

  public articles: Article[];
  public temp: Article[];
  public fournisseurs: Fournisseur[];
  public request: ArticleRequest;
  
  public operation: string;
  public searchValue = '';
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion

  constructor(
    private _articleListService: ArticleListService,
    private _fournisseurListService: FournisseurListService,
    private _authenticationService: AuthenticationService,
    private _articleDetailService: ArticleDetailService,
    private _documentService: DocumentService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new ArticleRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  generateStock() {
    this._documentService.stockArticles()
      .subscribe(
        (blobData: Blob) => this._documentService.openFile(blobData),
        () => {
          Swal.fire(
            {
              text: "Aucun document n'a été généré !",
              icon: 'warning',
              confirmButtonText: 'OK'
            }
          )
        }
      );
  }

  exportToExcel() {
    this._articleListService.exportToExcel()
    .subscribe(
      (blobData: Blob) => this._documentService.saveFile(blobData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "articles-stock.xlsx"),
      () => {
        Swal.fire(
          {
            text: "Aucun fichier n'a été exporté !",
            icon: 'warning',
            confirmButtonText: 'OK'
          }
        )
      }
    );
  }

  //#region Load Data

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();   
    const temp = this.temp.filter(function (d) {
      return ( isNaN(val) && (d.codeClient + '').toLowerCase().indexOf(val) !== -1 )
      || ( isNaN(val) && (d.designationClient + '').toLowerCase().indexOf(val) !== -1 )
      || ( isNaN(val) && (d.fournisseur.nom + '').toLowerCase().indexOf(val) !== -1 )
      || ( !isNaN(val) && d.quantiteColisStockComplet == parseInt(val) )  
      || ( !isNaN(val) && d.quantiteColisStandard == parseInt(val) )  
      || !val;
    });

    this.articles = temp;
    this.table.offset = 0;
  }

  onSizeChange(size) {              
    this.request.page.size = size;
    this.request.page.limit = size;
    this.pageCallback({ offset: 0, pageSize: size, limit: size})
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {            
    this.request.page.offset = pageInfo.offset;
    this.reloadTable();
  }

  reloadTable() {
    this._articleListService.getArticlesDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.articles = response.data as Article[];
        this.temp = this.articles;
      }
    );
  }

  clear() {
    this.request.article = null;
    this.request.stock = null;
    this.request.qte = null;
    this.request.fournisseur = null;
    this.request.operation = null;
    this.operation = null;
    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {
    if (this.operation) {
      const signe = this.operation.charAt(0);
  
      this.request.operation = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
      this.request.qte = this.request.operation === 'equal' ? parseInt(this.operation) : parseInt(this.operation.slice(1));
    }
    
    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;
    this.request.sort = `&sort=${col},${dir}`;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion

  //#region delete

  public articleSelected: number;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  get ReactiveCPForm() {
    return this.ReactivePasswordConfirmationForm.controls;
  }

  ReactiveCPFormOnSubmit() {
    this.ReactiveCPFormSubmitted = true;

    if (this.ReactivePasswordConfirmationForm.invalid) {
      return;
    }
    
    const swalWithBootstrapButtons = Swal.mixin(
      {
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger sup'
        },
        buttonsStyling: false
      }
    );
    
    swalWithBootstrapButtons.fire(
      {
        title: 'Vous êtes sûr ?',
        text: "Vous ne pourrez pas revenir en arrière !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          const password = this.ReactivePasswordConfirmationForm.value.password;
          
          this._authenticationService.checkPassword(password).subscribe(
            res => {
              this._articleDetailService.deleteArticle(this.articleSelected).subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'l\'article à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
                    }
                  );
                } 
              );
            },
            error => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Il y a eu un problème!',
                footer: `<p>${error.error}</p>`
              })
            }
          );
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'rien n\'a été supprimé',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()    
  }

  modalOpenForm(modalForm, id) {
    this.modalService.open(modalForm);    
    this.articleSelected = id;
  }

  //#endregion

  //#region HOOKS

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
   
    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._fournisseurListService.getFournisseur().subscribe(
      response => {       
        this.fournisseurs = response;
      }
    );

    this.contentHeader = {
      headerTitle: 'Liste',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Accueil',
            isLink: true,
            link: '/'
          },
          {
            name: 'Articles',
            isLink: false
          }
        ]
      }
    };

    this._articleListService.onArticleListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;

        this.articles = response.data as Article[];
        this.temp = this.articles;
      }
    );  
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }

  //#endregion

}
