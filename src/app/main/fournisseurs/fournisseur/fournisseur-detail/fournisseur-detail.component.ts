import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/auth/service';
import Swal from 'sweetalert2';
import { Fournisseur } from '../fournisseur.model';
import { FournisseurDetailService } from './fournisseur-detail.service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Article } from 'app/main/articles/article/article.model';

@Component({
  selector: 'app-fournisseur-detail',
  templateUrl: './fournisseur-detail.component.html',
  styleUrls: ['./fournisseur-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FournisseurDetailComponent implements OnInit {

  public hasRole: String[] = [];
  private _unsubscribeAll: Subject<any>;
  public contentHeader: Object;

  public edit: boolean;
  public fournisseur: Fournisseur;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  public ColumnMode = ColumnMode;
  public selectedOption = 25;

  private tempData: Article[];

  @ViewChild('fournisseurForm') fournisseurForm: NgForm;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _fournisseurDetailService: FournisseurDetailService,
    private _authService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
  ) { 
    this.edit = _fournisseurDetailService.editable;
    this._unsubscribeAll = new Subject();
  }

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

          this._authService.checkPassword(password).subscribe(
            res => {
              this._fournisseurDetailService.deleteFournisseur().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'le fournisseur à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/fournisseurs/list']);
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
            'Rien n\'a été supprimé',
            'error'
          );
        }
      }
    )

    this.modalService.dismissAll()    
  }

  modalOpenForm(modalForm) {
    this.modalService.open(modalForm);
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
            let body = this.fournisseur;
  
            this._fournisseurDetailService.updateFournisseur(body).subscribe(
              response => {
                console.log(response);
                
                Swal.fire(
                  {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Modifiées!',
                    html: `les données de ${response.nom} on été bien modifiées.`,
                    showConfirmButton: false,
                    timer: 1500
                  }
                ).then(
                  res => {
                    this._router.navigate([`/fournisseurs/detail/${this.fournisseur.id}`])
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
              'rien n\'a pas été modifié',
              'error'
            );
          }
        }
      );
    }
  }

  updateNav() {
    this._router.navigate([`/fournisseurs/edit/${this.fournisseur.id}`]);
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.tempData.filter(function (d) {
      return (d.codeClient + '').toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.fournisseur.articles = temp;
    this.table.offset = 0;
  }

  ngOnInit(): void {
    this.hasRole = this._authService.getRoles.map(({name}) => name);
    
    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._fournisseurDetailService.onFournisseurDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.fournisseur = response;        
        this.tempData = this.fournisseur.articles;
      }
    ); 
    
    let title = this.edit ? 'Modification' : 'Détail';

    this.contentHeader = {
      headerTitle: title,
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
            name: 'Fournisseurs',
            isLink: true,
            link: '/fournisseurs/list'
          },
          {
            name: this.fournisseur.nom,
            isLink: false
          }
        ]
      }
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
