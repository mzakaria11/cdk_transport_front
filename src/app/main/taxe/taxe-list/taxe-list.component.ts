import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TaxeNewService} from "../taxe-new/taxe-new.service";
import { Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {TaxeListService} from "./taxe-list.service";
import {TarifMssNewService} from "../../tarif-mss/tarif-mss-new/tarif-mss-new.service";



@Component({
  selector: 'app-taxe-list',
  templateUrl: './taxe-list.component.html',
  styleUrls: ['./taxe-list.component.scss'],
})
export class TaxeListComponent implements OnInit {

  rows: any[] = [];
  columns: any[] = [];
  selectedOption: any;
  hasRole: 'Super_admin';
  id: number;
  name: string;
  public contentHeader: object;
  transporteurs: any[] = [];
  public a: any;
  notFoundMessage = ""


  constructor(
      private http: HttpClient,
      private router: Router,
      private taxeListService: TaxeListService,
      private tarifmss : TarifMssNewService// Assuming the service handles fetching tax data
  ) {}

  uniqueTaxNames: string[] = [];

  fetchTaxData(transporteurId: number) {
    this.http.get<{departements: any[], transporteurId: number}>(`${environment.api}/taxe/list/${transporteurId}`).subscribe(data => {
      const taxNameSet = new Set<string>();
      data.departements.forEach(departement => {
        departement.taxes.forEach(taxe => {
          taxNameSet.add(taxe.taxName);
        });
      });

      // Convert the Set to an array for ngx-datatable column generation
      this.uniqueTaxNames = Array.from(taxNameSet).sort();

      // Transform the fetched data to fit the ngx-datatable format
      this.rows = this.transformDataForTable(data);

      this.generateColumns();
    });
  }

  transformDataForTable(data: any): any[] {
    let transformedRows = [];

    data.departements.forEach(departement => {
      let row = {
        departementName: departement.departementName,
        departementId: departement.departementId
      };

      // Initialize properties for each unique tax type with default values
      this.uniqueTaxNames.forEach(taxName => {
        const propName = `${taxName}`; // We'll store both value and ID in an object
        row[propName] = { value: null, id: null }; // Initialize with null values
      });

      // Populate the row object with tax objects containing value and ID
      departement.taxes.forEach(taxe => {
        const propName = `${taxe.taxName}`; // Same property name as above
        row[propName] = { value: taxe.taxValue, id: taxe.id }; // Assign the value and ID
      });

      transformedRows.push(row);
    });

    return transformedRows;
  }

  generateColumns() {
    // Start with fixed columns like 'departementName'
    this.columns = [
      { prop: 'departementName', name: 'Nom du departement', width: 150 }
    ];

    // Dynamically add columns for each unique tax type
    this.uniqueTaxNames.forEach(taxName => {
      this.columns.push({
        prop: `${taxName}`, // Match the property names in the transformed rows
        name: `${taxName}`,
        width: 120
      });
    });
  }

  loadTransporteurs() {
    this.tarifmss.getTransporteurs().subscribe((data: any[]) => {
      this.transporteurs = data.map(trans => ({
        id: trans.id,
        name: trans.nom // Assuming each object has an 'id' and 'name' property
      }));

      this.a = this.transporteurs[0];
      this.onTransporteurSelect(this.a.id);
    });
  }

  n = 3 ;
  onTransporteurSelect(t: any) {
    console.log(t);
    this.fetchTaxData(t + 0);
    this.n= t + 0
    this.getFormula()// Ensure the ID is treated as a number
  }



  navigateToDetail(id : any){
    this.router.navigate([`/taxe/edit/${id}`]);
}

  mdate: string;

  getDate(): void {
    const apiUrl = `${environment.api}/taxe/getmdate`;
    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.mdate = response;
        console.log(this.mdate);
      },
      error: (error) => {
        console.error('Error fetching date:', error);
      }
    });
  }

  formula : string;

  getFormula(): void {
    console.log("hahaha");
    const apiUrl = `${environment.api}/taxe/getformula?formula=${this.n}`;
    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.formula = response;
        console.log("hahaha" + this.formula);
      },
      error: (error) => {
        console.error('Error fetching date:', error);
      }
    });
  }
  ngOnInit() {
    this.loadTransporteurs();
    this.getDate()

    this.contentHeader = {
      headerTitle: 'List of Taxes',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Tax List',
            isLink: false
          }
        ]
      }
    };
    this.getFormula()
  }

  protected readonly console = console;

}









