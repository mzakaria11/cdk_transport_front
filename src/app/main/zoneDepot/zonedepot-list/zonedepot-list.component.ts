import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ZoneDepot } from '../zonedepot.model';
import { ZonedepotListService } from './zonedepot-list.service';

@Component({
  selector: 'app-zonedepot-list',
  templateUrl: './zonedepot-list.component.html',
  styleUrls: ['./zonedepot-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ZonedepotListComponent implements OnInit {

  public hasRole: String[] = [];

  private _unsubscribeAll: Subject<any>;
  public contentHeader: object;
  public searchText: any;
  public zones: [];

  public selectedId: number;

  public ReactiveZonesForm: FormGroup;
  public ReactiveZonesFormSubmitted = false;

  public ZoneForm = {
    etage: '',
    prefix: ''
  };

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private _authenticationService: AuthenticationService,
    private _zoneListService: ZonedepotListService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private _router: Router
  ) { 
    this._unsubscribeAll = new Subject();
  }

  get ReactiveZoneForm() {
    return this.ReactiveZonesForm.controls;
  }

  ReactiveZonesFormOnSubmit() {
    this.ReactiveZonesFormSubmitted = true;

    if (this.ReactiveZonesForm.invalid) {
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
        confirmButtonText: 'Oui, Ajoutez-le!',
        cancelButtonText: 'Non, annulez!',
        reverseButtons: true
      }
    ).then(
      (result) => {
        if (result.isConfirmed) {
          let form = this.ReactiveZonesForm.value;   

          const body = {
            etage: form.etage,
            nom: form.prefix
          };

          this._zoneListService.addZone(body).subscribe(
            response => {
              Swal.fire(
                {
                  position: 'top-end',
                  icon: 'success',
                  title: 'Ajouté!',
                  html: 'l\'empalcement a été ajouté.',
                  showConfirmButton: false,
                  timer: 1500
                }
              ).then(
                () => {
                  this._zoneListService.getZONEsDataRows();
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
          )
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
  
  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  modalOpenZone(modalZone) {
    this.modalService.open(modalZone, {
      centered: true,
      size: 'xs'
    });
  }

  ngOnInit(): void {
    this.hasRole = this._authenticationService.getRoles.map(({name}) => name);

    this.ReactiveZonesForm = this.formBuilder.group({
      etage: [''],
      prefix: ['P', Validators.required]
    });

    this._zoneListService.onZoneListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      response => {            
        this.zones = response?.reduce(
          (em, e) => em.set(e.nom.split('-')[0], [...em.get(e.nom.split('-')[0])||[], e]), new Map()
        )
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
            name: 'Zone depots',
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
