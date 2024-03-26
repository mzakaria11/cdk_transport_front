import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DestinataireDetailService } from '../destinataire-detail/destinataire-detail.service';
import { Destinataire } from '../destinataire.model';
import { DestinataireListService } from './destinataire-list.service';

@Component({
  selector: 'app-destinataire-list',
  templateUrl: './destinataire-list.component.html',
  styleUrls: ['./destinataire-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DestinataireListComponent implements OnInit {

  public hasRole: String[] = [];

  public ColumnMode = ColumnMode;
  public contentHeader: object;

  public rows: Destinataire[];
  public selectedOption = 25;
  public temp: Destinataire[] = [];
  

  public previousAddressFilter = '';
  public AddressFilter = '';
  public selectedAddress = [];

  public previousCodeUMFilter = '';
  public CodeUMFilter = '';
  public selectedCodeUM = [];

  public previousDelaiFilter = '';
  public DelaiFilter = '';
  public selectedDelai = [];

  public previousNomFilter = '';
  public NomFilter = '';
  public selectedNom = [];

  public ReactivePasswordConfirmationForm: FormGroup;
  public ReactiveCPFormSubmitted = false;

  public CPForm = {
    password: ''
  };

  @ViewChild(DatatableComponent) table: DatatableComponent;

  // Private
  private selectedId: number;
  private tempData: Destinataire[] = [];
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _destinataireListService: DestinataireListService,
    private _destinataireDetailService: DestinataireDetailService,
    private _authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) { 
    this._unsubscribeAll = new Subject();
  }

  //#region search
  
  filterByNom(event) {
    const filter = this.NomFilter;
    this.previousNomFilter = filter;
    this.temp = this.filterRows(filter, this.previousAddressFilter, this.previousCodeUMFilter, this.previousDelaiFilter);
    this.rows = this.temp;
  }

  filterByAddress(event) {
    const filter = this.AddressFilter;
    this.previousAddressFilter = filter;
    this.temp = this.filterRows(this.previousNomFilter, filter, this.previousCodeUMFilter, this.previousDelaiFilter);
    this.rows = this.temp;
  }

  filterByCodeUM(event) {
    const filter = this.CodeUMFilter;
    this.previousCodeUMFilter = filter;
    this.temp = this.filterRows(this.previousNomFilter, this.previousAddressFilter, filter, this.previousDelaiFilter);
    this.rows = this.temp;
  }

  filterByDelai(event) {
    const filter = this.DelaiFilter;
    this.previousDelaiFilter = filter;
    this.temp = this.filterRows(this.previousNomFilter, this.previousAddressFilter, this.previousCodeUMFilter, filter);
    this.rows = this.temp;
  }

  filterRows(NomFilter, AddressFilter, CodeUMFilter, DelaiFilter): any[] {       
    return this.tempData.filter(
      row => {
        const isPartialDelaiMatch = row.delaiPeremption == DelaiFilter || DelaiFilter === '';
        const isPartialAddressMatch = (row.adresseLivraison + '').toLowerCase().indexOf(AddressFilter) !== -1 || AddressFilter === '';
        const isPartialCodeUMMatch = (row.codeUM + '').toLowerCase().indexOf(CodeUMFilter) !== -1 || CodeUMFilter === '';
        const isPartialNomMatch = (row.nom + '').toLowerCase().indexOf(NomFilter) !== -1 || NomFilter === '';

        return  isPartialNomMatch && isPartialAddressMatch && isPartialCodeUMMatch && isPartialDelaiMatch;
      }
    );
  }

  //#endregion
  
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
              this._destinataireDetailService.deleteDestinataire(this.selectedId).subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'Le destinataire à été supprimé.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                  ).then(
                    () => {
                      this._destinataireListService.getDestinatairesDataRows();
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
            name: 'Destinataires',
            isLink: false
          }
        ]
      }
    };

    this._destinataireListService.onDestinataireListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {             
      this.rows = response.data;
      this.tempData = this.rows;
    });
  }
}
