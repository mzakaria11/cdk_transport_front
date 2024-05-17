import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {TarifTotalCalculeService} from "./tarif-total-calcule.service";
import {ActivatedRoute, Router} from "@angular/router";
import {formatDate} from "@angular/common";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

@Component({
  selector: 'app-tarif-total-calcule',
  templateUrl: './tarif-total-calcule.component.html',
  styleUrls: ['./tarif-total-calcule.component.scss']
})
export class TarifTotalCalculeComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private cdr: ChangeDetectorRef,
              private http: HttpClient,
              private tariffService: TarifTotalCalculeService,
              private router : Router,
              private route: ActivatedRoute) { }
  rows = [];
    currentInput = this.createEmptyRow();

  forceTableRedraw() {
    // Attempt to force refresh
    this.table.recalculate();
    setTimeout(() => {
      this.rows = [...this.rows]; // Reassign rows to trigger change detection
      this.cdr.detectChanges();

    }, 0);
  }

  submitRow() {
    const url = `${environment.api}/tariffs/cheapest-transporteur`;
    const formData = new FormData();
    formData.append('weight', this.currentInput.weight);
    formData.append('palette', this.currentInput.nombrePalette);
    formData.append('destinataireId', this.currentInput.destinataireId);

    this.http.post<any>(url, formData).subscribe({
      next: (response) => {
        const newRow = {
          unixDate: this.unixDate,
          Destinataire : response.destinataire,
          idBcs : 'test',
          weight: this.currentInput.weight,
          palette: this.currentInput.nombrePalette,
          cheapestTariff: response.cheapestTariff,
          cheapestTransporteurName: response.cheapestTransporteurName,
          typeTransporteur : response.type

        };
        console.log(newRow);
        this.rows.push(newRow);
        this.currentInput = this.createEmptyRow();
        this.forceTableRedraw(); // Call to force redraw after updating rows
      },
      error: (error) => console.error('Error:', error)
    });
  }

  createEmptyRow() {
    return { unixDate: '' , destinataireId: '', idBcs : '',  weight: '', nombrePalette: '', tarifTotal: '' , bestTransporteur: '', typeTransporteur: '' };
  }
    columns = [
        { prop: 'unixDate', name: 'Date' , width: '130' },
        { prop: 'destinataire', name: 'Destinataire' , width: '150' },
        { prop: 'idBcs', name: 'ID BCS' , width: '80' },
        { prop: 'weight', name: 'Poids' , width: '75' },
        { prop: 'palette', name: 'Palettes' , width: '85' },
        { prop: 'cheapestTransporteurName', name: 'Transporteur' , width: undefined },
        { prop: 'cheapestTariff', name: 'Tarif Total' , width: '90' },
        { prop: 'typeTransporteur', name: 'Type de Transporteur' , width: '150' }
    ];
  setColumns(data: any[]) {
    if (data.length > 0) {
      // Dynamically create columns based on the first item keys
      this.columns = Object.keys(data[0]).map(key => ({
        prop: key,
        name: key.replace(/([A-Z])/g, ' $1').trim(),
          width: 'auto'// Add space before capital letters and trim
      }));
    }
  }



  unixDate: number ; // example Unix date
  id: string;
    basicDPdata: NgbDateStruct;

    envoieEmail() {
        if (!this.basicDPdata) {
            alert('Please select a date first!');
            return;
        }

        // Create a Date object from the NgbDateStruct
        const dateToSend = new Date(this.basicDPdata.year, this.basicDPdata.month - 1, this.basicDPdata.day);
        const formattedDate = `${this.basicDPdata.year}-${this.basicDPdata.month}-${this.basicDPdata.day}`;

        // HTTP GET request
        const apiUrl = `${environment.api}/tariffs/sendEmail?unixDate=${this.unixDate}&date=${formattedDate}`;
        console.log(this.unixDate, formattedDate);
        this.http.get(apiUrl).subscribe({
            next: (response) => console.log('Emails sent successfully', response),
            error: (error) => console.error('Error sending emails', error)
        });
    }

    toTransport() {
        this.tariffService.getTariffDataByDate(this.unixDate).subscribe({
            next: (data) => {

                // This callback should update rows, not columns
                this.rows = [...this.rows, ...data]; // Append new data to existing rows, ensuring no modification to columns.
                this.forceTableRedraw();
                // Call to force redraw after updating rows.
            },
            error: (error) => console.error('Error fetching data:', error)
        });
    }
  reateRow(response: any) {
    const newRow = {
      ...response,
      className: this.determineClass(response.cheapestTariff)
    };
    return newRow;
  }

  determineClass(tariff: number): string {
    if (tariff < 50) return 'cell-critical';
    if (tariff >= 50 && tariff < 75) return 'cell-warning';
    return 'cell-ok';
  }


  generateCsv(){
    const url = `${environment.api}/tariffs/generate-csv/?unixDate=${this.unixDate}`;
      return this.http.get(url, { responseType: 'blob' as 'json' }).subscribe((response: any) => {
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'messagerie.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });

  }

  generateExcel() {
    const url = `${environment.api}/tariffs/generate-excel/?unixDate=${this.unixDate}`;
    return this.http.get(url, { responseType: 'blob' }).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/zip' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'RapportTransporteurs.zip';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        },
        (error) => {
          console.error('Error downloading the file.', error);
          // Implement further error handling here (e.g., user notifications)
        }
    );
  }
    public contentHeader: Object;

    ngOnInit(): void {
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
                        name: 'Calcule',
                        isLink: true,
                        link: `/ctt/list/${this.unixDate}`
                    }
                ]
            }
        };

      this.tariffService.getTariffData().subscribe(data => {
      this.rows = data;
      this.setColumns(data);
    });

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.unixDate = +this.id;
      console.log('Retrieved ID:dddddddddddddddddddddddddddddddddddddddddddddddd', this.unixDate);
    });

    console.log('Retrieved ID:ddddddddddddddd', this.unixDate);

    this.toTransport();
  }




    confirmExpedition() {

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
                title: 'Vous voulez Vraiment Confirmer L\'expedition ?',
                text: "Vous ne pourrez pas revenir en arrière !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui, Confirmez!',
                cancelButtonText: 'Non, annulez!',
                reverseButtons: true
            }
        )
            .then(
                (result) => {
                    if (result.isConfirmed) {

                        this.confirm()

                    }
                    else if ( result.dismiss === Swal.DismissReason.cancel )
                    {
                        swalWithBootstrapButtons.fire(
                            'Annulé',
                            'Rien n\'a été confirmer',
                            'error'
                        );
                    }
                }
            );

    }







    confirm() {



        const url = `${environment.api}/grouped/confirme/?unixDate=${this.unixDate}`;


            this.http.post(url, null) // Pass null as the body
                .subscribe(
                    response => {
                        console.log('Update successful', response);
                    },
                    error => {
                        console.error('Error updating', error);
                    }
                );

        this.router.navigate(['/repartition/historique']);
        }





}





