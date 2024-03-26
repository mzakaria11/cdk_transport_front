import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { FournisseurListService } from 'app/main/fournisseurs/fournisseur/fournisseur-list/fournisseur-list.service';
import { Fournisseur } from 'app/main/fournisseurs/fournisseur/fournisseur.model';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { takeUntil } from 'rxjs/operators';
import { APiResponse } from 'app/api-response';
import { BLE, BleRequest } from '../ble.model';
import { BonlivraisonentreeListService } from './bonlivraisonentree-list.service';
import { BonlivraisonentreeDetailService } from '../bonlivraisonentree-detail/bonlivraisonentree-detail.service';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-bonlivraisonentree-list',
  templateUrl: './bonlivraisonentree-list.component.html',
  styleUrls: ['./bonlivraisonentree-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BonlivraisonentreeListComponent implements OnInit {

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
  
  public bles: BLE[];
  public temp: BLE[];
  public fournisseurs: Fournisseur[];
  public request: BleRequest;

  public dateStart;
  public dateEnd;

  public operation: string;
  public searchValue = '';
  
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _bleListService: BonlivraisonentreeListService,
    private _bleDetailService: BonlivraisonentreeDetailService,
    private _fournisseurListService: FournisseurListService,
    private _authenticationService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal
  ) { 
    this.request = new BleRequest();
    this.request.page.limit = this.currentPageLimit;
    this._unsubscribeAll = new Subject();
  }

  // list: any[];

  // handleFileInput(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const workbook = XLSX.read(e.target.result, { type: 'binary' });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  //       this.list = jsonData;
  //       console.log(jsonData);
  //     };
  //     reader.readAsBinaryString(file);
  //   }
  // }

  // convertExcelDateToJSDate(excelDate: number): Date {
  //   const utcDays = excelDate - 25569; // Adjust for Excel's date epoch and leap year bug
  //   const utcMilliseconds = utcDays * 86400 * 1000; // Convert days to milliseconds
  //   const date = new Date(utcMilliseconds);
  //   return date;
  // }

  // async sync() {
  //   console.log(this.list);
    
  //   const asyncRequests = this.list.map(async (e) => {
  //     try {
            
  //       const response: any = await this._bleListService.getArticle(e.code);

  //       let colis = {
  //         idArticle : response.id,
  //         idUme: 1236,
  //         numeroLot: e.lot,
  //         quantiteColisRecue: e.qte,
  //         datePeremption: formatDate(this.convertExcelDateToJSDate(e.dlc), "yyyy-MM-dd", "en")
  //       };

  //       console.log(colis);
        
  //       return await this._bleListService.syncLigne(colis);
  //     } catch (error) {
  //       console.error('Error:', error);
  //       return error;
  //     }
  //   });

  //   try {
  //     const results = await Promise.all(asyncRequests);
  //     // console.log('All results:', results);
  //   } catch (error) {
  //     console.error('An error occurred:', error);
  //   }

  // }

  setAsVerified(ble: BLE) {
    console.log(ble);
    ble.verified = !ble.verified;
    this._bleDetailService.updateBle(ble)
    .subscribe(
      response => {
        console.log(response);
      }
    )
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    
    const temp = this.temp.filter(function (d) {
      return ( (d.numeroBonLivraison + '').toLowerCase().indexOf(val) !== -1 )
      || ( isNaN(val) && (d.fournisseur.nom + '').toLowerCase().indexOf(val) !== -1 )
      || ( !isNaN(val) && d.quantitePalette == parseInt(val) )  
      || !val;
    });

    this.bles = temp;
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
    this._bleListService.getBlesDataRows(this.request).then(
      (response) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;        
        this.bles = response.data as BLE[];
        this.temp = this.bles;
      }
    );
  }

  clear() {
    this.request.numeroBl = null;
    this.request.fournisseur = null;
    this.request.qtePalette = null;
    this.operation = null;
    this.request.operation = null;
    this.request.dateReceptionDebut = null;
    this.request.dateReceptionFin = null;
    this.request.lve = null;
    this.dateStart = null;
    this.dateEnd = null;
    this.pageCallback({ offset: 0, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  search() {
    if (this.operation) {
      const signe = this.operation.charAt(0);
      this.request.operation = signe === '>' ? 'greater' : signe === '<' ? 'less' : 'equal';
      this.request.qtePalette = this.request.operation === 'equal' ? parseInt(this.operation) : parseInt(this.operation.slice(1));
    }
        
    this.request.dateReceptionDebut = this.dateStart ? new Date(this.dateStart).getTime() / 1000 : null;
    this.request.dateReceptionFin = this.dateEnd ? new Date(this.dateEnd).getTime() / 1000 : null;
    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  onSort(event) {
    const dir = event.sorts[0].dir;
    const col = event.sorts[0].prop ;
    this.request.sort = `&sort=${col},${dir}`;

    this.pageCallback({ offset: this.request.page.offset, pageSize: this.request.page.size, limit: this.request.page.size });
  }

  //#region delete

  public bleSelected: number;

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
              this._bleDetailService.deleteBle(this.bleSelected).subscribe(
                res => {
                  Swal.fire(
                    {
                      position: 'top-end',
                      icon: 'success',
                      title: 'Supprimé!',
                      html: 'BLE à été supprimé.',
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
    this.bleSelected = id;
  }

  //#endregion

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
            name: 'BL',
            isLink: false
          }
        ]
      }
    };

    this._bleListService.onBleListChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      (response: APiResponse) => {
        this.request.page.count = response.size;
        this.request.page.limit = this.request.page.size;
        this.bles = response.data;

        this.temp = this.bles;
      }
    );  
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.request = undefined;
  }

}
