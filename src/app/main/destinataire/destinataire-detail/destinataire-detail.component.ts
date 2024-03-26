import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Destinataire } from '../destinataire.model';
import { DestinataireDetailService } from './destinataire-detail.service';

@Component({
  selector: 'app-destinataire-detail',
  templateUrl: './destinataire-detail.component.html',
  styleUrls: ['./destinataire-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DestinataireDetailComponent implements OnInit {

  public hasRole: String[] = [];

  public edit: boolean;
  public data: Destinataire;

  public contentHeader: object;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };
  
  @ViewChild('destinataireForm') destinataireForm: NgForm;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _destinataireDetailService: DestinataireDetailService,
    private modalService: NgbModal,
    private _authenticationService: AuthenticationService,
    private _authService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private _router: Router,
  ) { 
    this._unsubscribeAll = new Subject();
    this.edit = _destinataireDetailService.editable;
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
              this._destinataireDetailService.deleteDestinataire().subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'le destinataire à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._router.navigate(['/destinataires/list']);
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
            let idPays = form.value.pays == -1 ? 1 : parseInt(form.value.pays);

            let body = {      
              "id": this.data.id,    
              "adresseLivraison": form.value.nom + '  ' + form.value.adresselivraisonNumero  + '  ' + form.value.adresselivraisonRue+ '  ' + form.value.adresselivraisonComplement1  + '  ' + form.value.adresselivraisonCodepostal + '  ' + form.value.adresselivraisonLocalite,
              "telephone": form.value.telephone, 
              "nom": form.value.nom, 
              "commentaire": form.value.commentaire, 
              "codeUM": form.value.codeUM,
              "email": form.value.email, 
              "adresseFacturation": form.value.adresseFacturation, 
              "departement": form.value.departement, 
              "adresselivraisonNom": form.value.nom, 
              "adresselivraisonNumero": form.value.adresselivraisonNumero, 
              "adresselivraisonRue": form.value.adresselivraisonRue, 
              "adresselivraisonComplement1": form.value.adresselivraisonComplement1, 
              "adresselivraisonComplement2": form.value.adresselivraisonComplement2, 
              "adresselivraisonCodepostal": form.value.adresselivraisonCodepostal, 
              "adresselivraisonLocalite": form.value.adresselivraisonLocalite, 
              "delaiPeremption": form.value.delaiPeremption, 
              "idPays": idPays
            };
           
            this._destinataireDetailService.updateDestinataire(body).subscribe(
              response => {
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
                  () => {
                    this._router.navigate([`destinataires/detail/${this.data.id}`]);
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
              'rien n\'a été modifié',
              'error'
            );
          }
        }
      );  
    }
  }

  modalOpenForm(modalForm) {
    this.modalService.open(modalForm);
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this._destinataireDetailService.onDestinataireDetailChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.data = response;
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
            name: 'Destinataires',
            isLink: true,
            link: '/destinataires/list'
          },
          {
            name: this.data.nom,
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
