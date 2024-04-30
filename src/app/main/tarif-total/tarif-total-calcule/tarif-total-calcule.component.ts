import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {TarifTotalCalculeService} from "./tarif-total-calcule.service";
import {ActivatedRoute, Router} from "@angular/router";

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
          UnixDate: this.unixDate,
          DestinataireId: this.currentInput.destinataireId,
          IdBcs : 'test',
          Weight: this.currentInput.weight,
          NombrePalette: this.currentInput.nombrePalette,
          TarifTotal: response.cheapestTariff,
          BestTransporteur: response.cheapestTransporteurName,
          TypeTransporteur : response.type

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
        { prop: 'idDestinataire', name: 'Destinataire' , width: '110' },
        { prop: 'idBcs', name: 'ID BCS' , width: '80' },
        { prop: 'weight', name: 'Weight' , width: '75' },
        { prop: 'palette', name: 'Palettes' , width: '85' },
        { prop: 'cheapestTransporteurName', name: 'Best Transporteur' , width: undefined },
        { prop: 'cheapestTariff', name: 'Tarif Total' , width: '90' },
        { prop: 'typeTransporteur', name: 'Type Transporteur' , width: '150' }
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

  ngOnInit(): void {
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




}
