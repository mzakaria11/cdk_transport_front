import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthenticationService } from 'app/auth/service';
import { BCS, LignBcsRequest, LigneBcs } from '../bcs.model';
import { DetailBcsService } from './detail-bcs.service';
import { ArticleListService } from 'app/main/articles/article/article-list/article-list.service';
import { BLS } from 'app/main/bonLivraison/sortie/bls.model';
import { DocumentService } from 'app/main/documents/document.service';

@Component({
  selector: 'app-detail-bcs',
  templateUrl: './detail-bcs.component.html',
  styleUrls: ['./detail-bcs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailBcsComponent implements OnInit {

  //#region Variables

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
  
  public stat: any[] = [
    { name: 'Totalité', id: 'inStock' },
    { name: 'Partiel', id: 'partial' },
    { name: 'Rupture', id: 'outStock' },
  ];

  public bcs: BCS;
  public bls: BLS;
  public dateCmd: string;
  public currDate: string;
  public dateExpedition: string;
  public expedie: boolean = false;

  public lignesBcs: LigneBcs[];
  public temp: LigneBcs[];
  public articles: any[] = [];
  public ums: any[];

  public request: LignBcsRequest;
  public edit: boolean;
   
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  //#endregion
  
  constructor(
    private _authenticationService: AuthenticationService,
    private _bcsDetailService: DetailBcsService,
    private _articleListService: ArticleListService,
    private _documentService: DocumentService,
    private _router: Router,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.edit = _bcsDetailService.editable;
    
    this.currDate = formatDate(new Date(), "yyyy-MM-dd", "en");
    
    this.request = new LignBcsRequest();
    this.request.page.limit = this.currentPageLimit;

    this._unsubscribeAll = new Subject();
  }

  navigation() {
    this._router.navigate([`/bcs/edit/${this.bcs.id}`]);
  }

  pdf() {   
    this._documentService.generatePdfById("stockBcs", this.bcs.id)
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

  openDateModal(modal): void {
    this.modalService.open(modal, {
      centered: true
    });
  }

  setDateExpedition() {
    console.log(this.dateExpedition);
    let ts = new Date(this.dateExpedition).setHours(4) / 1000;
    
    this._bcsDetailService.setUmsDateExpeditionByBcs(ts)
    .subscribe(
      () => {
        Swal.fire(
          {
            position: 'top-end',
            icon: 'success',
            title: 'Modifiées!',
            html: `Les données du BCS on été bien modifiées.`,
            showConfirmButton: false,
            timer: 1500
          }
        ).then(
          () => {
            this.syncBcs();
          }
        )
      },
      (error) => console.error('Failed to update expedition date.', error)
    );

    this.modalService.dismissAll();
  }

  //#region Load DATA

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
    this._bcsDetailService.getLignesDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;       
                
        this.lignesBcs = response.data as LigneBcs[];
        this.temp = this.lignesBcs;
      }
    );
  }

  clear() {
    this.request.idArticle = null;
    this.request.stat = null;

    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {      
    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;
    this.request.sort = `&sort=${col},${dir}`;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#endregion 

  //#region forms update and delete

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

          this._authenticationService.checkPassword(password)
          .subscribe(
            () => {
              this._bcsDetailService.delete().subscribe(
                () => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'UME à été supprimé!',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/ume/list']);
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

  submit(form) {    
    if (form.valid) {     
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
          confirmButtonText: 'Oui, modifiez-le!',
          cancelButtonText: 'Non, annulez!',
          reverseButtons: true
        }
      )
      .then(
        (result) => {       
          if (result.isConfirmed) {              
            let body = {     
              id: this.bcs.id,
              poidsBrut: form.value.poidsBrut, 
            }; 
                                      
            this._bcsDetailService.update(body).subscribe(
              response => {
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `Les données du BCS on été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  () => {
                    this._router.navigate([`/bcs/detail/${response.id}`])
                  }
                )
              },
              err => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Il y a eu un problème!',
                  footer: `<p>${err}</p>`
                })
              }
            );
          } 
          else if ( result.dismiss === Swal.DismissReason.cancel ) 
          {
            swalWithBootstrapButtons.fire(
              'Annulé',
              'Rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    }
  }

  //#endregion

  //#region Ajouter ligne

  public ReactiveLigneForm: FormGroup;
  public ReactiveLigneFormSubmitted = false;

  public ligneForm = {
    article: '',
    qte: ''
  };

  get getReactiveLigneForm() {
    return this.ReactiveLigneForm.controls;
  }

  ReactiveLigneFormOnSubmit() {   
    this.ReactiveLigneFormSubmitted = true;

    if (this.ReactiveLigneForm.invalid) {
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
        confirmButtonText: 'Oui, ajoutez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          let form = this.ReactiveLigneForm.value;   

          let body = {
            idArticle: form.article,
            numeroCommande: this.bcs.numeroCommande,
            qteColis: form.qte
          }

          this._bcsDetailService.addLigne(body).subscribe(
            () => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajout!',
                  html: 'Ligne a été ajouté.',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this.reloadTable();
                }
              );
            },
            err => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Il y a eu un problème!',
                footer: `<p>${err}</p>`
              })
            }
          );
          
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annulé',
            'rien n\'a été ajouté',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()    
  }

  openModalLigne(modal) {
    this.modalService.open(modal);
  }
  
  //#endregion

  //#region HOOKS

  syncBcs() {
    this._bcsDetailService.onBCSDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.bcs = response;
        this.bls = this.bcs?.blsList[0];
        this.ums = this.bcs.umsList;

        this.expedie = this.ums.find( (u) => u.dateFermeture == null || u.dateExpedition != null ) ? false : true;

        this.dateCmd = formatDate(new Date(this.bcs.dateCommande), 'yyyy-MM-dd', "en");
      }
    ); 
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);
    
    this.ReactiveLigneForm = this.formBuilder.group({
      article: ['', [Validators.required]],
      qte: ['', [Validators.required]],
    });

    this._articleListService.getAllArticlesDataRows()
    .then(
      (response) => {
        try {
          response.forEach(
            (el) => {
              const name = el.codeClient + ' | ' + el.designationClient;
              const id = el.id;
              this.articles = [...this.articles, { name, id }];
            }
          );          
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

    this._bcsDetailService.getLignesDataRows(this.request)
    .then(
      (response) => {
        try {       
          this.request.page.count = response.size;
          this.request.page.limit = this.request.page.size;       
          
          this.lignesBcs = response.data as LigneBcs[];
          this.temp = this.lignesBcs;

        } catch (error) {
          console.error('Error while processing the response:', error);
        }
      }
    )
    .catch(
      (error) => {
        console.error('Error fetching Lignes BCS:', error);
      }
    );
    
    this.syncBcs();

    let title = `${this.edit ? 'Modification' : 'Détail'} ${this.bcs.numeroCommande}`;

    this.contentHeader = {
      headerTitle: 'Bon de commande de sortie',
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
            name: 'BCS',
            isLink: true,
            link: '/bcs/list'
          },
          {
            name: title,
            isLink: false
          }
        ]
      }
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }
  
  //#endregion

}
