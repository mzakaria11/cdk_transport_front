import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TaxeNewService} from "../taxe-new/taxe-new.service";
import { Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";



@Component({
  selector: 'app-taxe-list',
  templateUrl: './taxe-list.component.html',
  styleUrls: ['./taxe-list.component.scss'],
})
export class TaxeListComponent implements OnInit {


  rows: any[] = [];
  columns: any[] = [];
  selectedOption : any;
  hasRole: 'Super_admin';
  id: number;
  name: string;
  public contentHeader: object;
  transporteurs: any[] = [];
  public a : any;
  notFoundMessage = ""


  constructor(private http: HttpClient,
              private router: Router,
              private _taxeNewService : TaxeNewService) { }




  uniqueTaxNames: string[] = [];


  fetchTaxeData(transporteurId: number) {
    this.http.get<any>(`http://localhost:8080/api/taxe/list/${transporteurId}`).subscribe(data => {
      // Extract unique tax names and prepare data for the table
      const taxNamesSet = new Set<string>();

      data.departements.forEach(departement => {

        departement.taxes.forEach(taxe => {
          if  (taxe.taxName !== "TARIF DE BASE" && taxe.taxName !== "TARIF GLOBAL HT" ) {
            taxNamesSet.add(taxe.taxName);
          }
        });
      });

      this.uniqueTaxNames = Array.from(taxNamesSet)

      this.rows = this.transformDataForTable(data);
      this.generateColumns();



    });
  }

  transformDataForTable(data: any): any[] {
    let transformedRows = [];
    return data.departements.map(departement => {
      const row = {
        departementName: departement.departementName,
        departementId: departement.departementId,
      };

      this.uniqueTaxNames.forEach(tax => {

        const propName = `${tax}`;
        if  (propName !== "TARIF DE BASE" && propName !== "TARIF GLOBAL HT" ) {


          row[propName] = {prix: null, id: null};
        }

      });





      departement.taxes.forEach(tax => {

        const propName = `${tax.taxName}`;
        if  (tax.prix !== null ) {
          row[propName] = {prix: tax.prix, id: tax.id};
          console.log(row[propName])
        }
        else{
          row[propName] = {prix: "-", id: tax.id};
        }

// Assign the price and ID
      });




      return row;
    });
  }

  generateColumns() {
    this.columns = [
      { prop: 'departementName', name: 'Nom du departement', width: 150 },

    ];

      this.uniqueTaxNames.forEach(tax => {

          const propName = `${tax}`;
        console.log(propName)
        this.columns.push({
        prop: propName,
        name: `${tax}`,
        width: 120,
        });

      });

  }





setMessageValueAfterDelay() {
    setTimeout(() => {
      this.notFoundMessage= "Aucun tarif messagerie n'a été trouvé"; // Set the variable to "hello" after 5 seconds
    }, 5000);
  }

  loadTransporteurs() {
    this._taxeNewService.getTransporteurs().subscribe((data: any[]) => {
      this.transporteurs = data.map(trans => ({
        id: trans.id,
        name: trans.nom // Assuming each object has an 'id' and 'name' property
      }));

      console.log(this.transporteurs)
      this.a = this.transporteurs[0];
      this.onTransporteurSelect(this.a.id)

      console.log(this.a)

      this.onTransporteurSelect(this.a.id)
      this.setMessageValueAfterDelay()
    });




  }

  navigateToDetail(tarifId: number) {
    this.router.navigate([`/taxe/edit/${tarifId}`]);
  }

  onTransporteurSelect(t: any){
    console.log(t);
    this.fetchTaxeData(t+0);
  }

  ngOnInit() {

    this.loadTransporteurs();



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
            name: 'Taxe',
            isLink: false
          }
        ]
      }
    };

    console.log(this.a)
  }

  protected readonly console = console;
}









