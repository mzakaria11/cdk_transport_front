import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgbDateStruct, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  I18n,
  CustomDatepickerI18n
} from 'app/main/forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DepartementDetailService } from '../departement-detail/departement-detail.service';
import {DepartementListService} from "./departement-list.service";

@Component({
  selector: 'app-departement-list',
  templateUrl: './departement-list.component.html',
  styleUrls: ['./departement-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class DepartementListComponent implements OnInit {

  public hasRole: String[] = [];
  public contentHeader: Object;

  public rows;
  public selectedOption = 25;
  public ColumnMode = ColumnMode;

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  @ViewChild(DatatableComponent) table: DatatableComponent;

  private selectedId: number;
  private _unsubscribeAll: Subject<any>;

  constructor(
      private _departementListService: DepartementListService,
      private _departementDetailService: DepartementDetailService,
      private _authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private modalService: NgbModal
  ) {
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

            this._authenticationService.checkPassword(password).subscribe(
                res => {
                  this._departementDetailService.deleteDepartement(this.selectedId).subscribe(
                      res => {
                        Swal.fire(
                            {
                              position: 'top-end',
                              icon: 'success',
                              title: 'Supprimé!',
                              html: 'Le Transporteur à été supprimé.',
                              showConfirmButton: false,
                              timer: 1500
                            }
                        ).then(
                            () => {
                                console.log("wsllt")
                              this._departementListService.getDepartementDataRows();
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

  modalOpenForm(modalForm, id) {
    this.modalService.open(modalForm);
    this.selectedId = id;
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactivePasswordConfirmationForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

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
            name: 'Departement',
            isLink: false
          }
        ]
      }
    };

    this._departementListService.onDepartementListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
        response => {
          this.rows = response.data;
        }
    );
  }
}




