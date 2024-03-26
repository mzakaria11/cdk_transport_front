import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TarifMssListService} from "../../tarif-mss/tarif-mss-list/tarif-mss-list.service";
import {TarifMssDetailService} from "../../tarif-mss/tarif-mss-detail/tarif-mss-detail.service";
import {AuthenticationService} from "../../../auth/service";
import {FormBuilder} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {Subject, Subscription} from "rxjs";
import {Departement} from "../../departement/departement.model";
import { ActivatedRoute } from '@angular/router';


interface TarifAffResponse {
  departements: Array<{
    departementName: string;
    departementId: number;
    tarifs: Array<{ nbrPalette: number; prix: number; }>;
  }>;
  transporteurId: number;
}


@Component({
  selector: 'app-tarif-aff-full-list',
  templateUrl: './tarif-aff-full-list.component.html',
  styleUrls: ['./tarif-aff-full-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class TarifAffFullListComponent implements OnInit {
  rows: any[] = [];
  columns: any[] = [];
  selectedOption : any;
  hasRole: 'Super_admin';
  id: number;
  private routeSub: Subscription;
  name: string;

  transporteurName : any;
  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private f : FormBuilder,
              private router: Router) { }



  ngOnInit() {
    
    this.routeSub = this.route.params.subscribe(params => {
      this.id = +params['id']; // The '+' converts the string parameter to a number
    });

    this.selectedOption = '10'
    this.fetchTarifAffData(this.id); // Example Transporteur ID
  }

  uniqueNbrPalettes: number[] = [];

  fetchTarifAffData(transporteurId: number) {
    this.http.get<{departements: any[], transporteurId: number}>(`http://localhost:8080/api/tarifaff/list/${transporteurId}`).subscribe(data => {
      const nbrPalettesSet = new Set<number>();

      // Iterate through the data to fill the set with unique nbrPalette values
      data.departements.forEach(departement => {
        departement.tarifs.forEach(tarif => {
          nbrPalettesSet.add(tarif.nbrPalette);
        });
      });

      // Convert the Set to an array for ngx-datatable column generation
      this.uniqueNbrPalettes = Array.from(nbrPalettesSet).sort((a, b) => a - b);

      // Transform the fetched data to fit the ngx-datatable format
      this.rows = this.transformDataForTable(data);

      // Assume a method to generate columns based on uniqueNbrPalettes
      this.generateColumns();
    });
  }

  transformDataForTable(data: any): any[] {
    // Initialize an empty array to hold the transformed rows
    let transformedRows = [];

    // Iterate over each departement in the data
    data.departements.forEach(departement => {
      // Create a base object for the departement row, including its name
      let row = {
        departementName: departement.departementName,
        departementId: departement.departementId
      };

      // Initialize properties for each unique nbrPalette with default values
      this.uniqueNbrPalettes.forEach(nbrPalette => {
        const propName = `palette${nbrPalette}Price`; // Construct the property name
        row[propName] = null; // Initialize with null or another suitable default value
      });

      // Populate the row object with actual prices for each nbrPalette
      departement.tarifs.forEach(tarif => {
        const propName = `palette${tarif.nbrPalette}Price`; // Construct the property name based on nbrPalette
        row[propName] = tarif.prix; // Assign the actual price
      });

      // Add the fully populated row object to the transformedRows array
      transformedRows.push(row);
    });

    // Return the array of transformed row objects
    return transformedRows;
  }


  generateColumns() {
    // Start with fixed columns like 'departementName'
    this.columns = [
      { prop: 'departementName', name: 'Nom du departement', width: 150 }
    ];

    // Dynamically add columns for each unique nbrPalette
    this.uniqueNbrPalettes.forEach(palette => {
      this.columns.push({
        prop: `palette${palette}Price`, // Match the property names in the transformed rows
        name: `Palette ${palette}`,
        width: 120
      });
    });
  }


}