
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
import {TarifMssNewService} from "../../tarif-mss/tarif-mss-new/tarif-mss-new.service";
interface TarifAffResponse {
    departements: Array<{
    departementName: string;
    departementId: number;
    tarifs: Array<{ nbrPalette: number; prix: number; id: number}>;
    }>;
    transporteurId: number;

}
@Component({
  selector: 'app-tarif-aff-list',
  templateUrl: './tarif-aff-list.component.html',
  styleUrls: ['./tarif-aff-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TarifAffListComponent implements OnInit {

    rows: any[] = [];
    columns: any[] = [];
    selectedOption : any;
    hasRole: 'Super_admin';
    id: number;
    private routeSub: Subscription;
    name: string;
    transporteurName : any;
    public contentHeader: object;
    transporteurs: any[] = [];
    public a : any;
    notFoundMessage = ""


    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private f : FormBuilder,
                private router: Router,
                private _tarifMssNewService : TarifMssNewService) { }




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
        let transformedRows = [];

        data.departements.forEach(departement => {
            let row = {
                departementName: departement.departementName,
                departementId: departement.departementId
            };

            // Initialize properties for each unique nbrPalette with default values
            this.uniqueNbrPalettes.forEach(nbrPalette => {
                const propName = `palette${nbrPalette}`; // We'll store both price and ID in an object
                row[propName] = { prix: null, id: null }; // Initialize with null values
            });

            // Populate the row object with tariff objects containing price and ID
            departement.tarifs.forEach(tarif => {
                const propName = `palette${tarif.nbrPalette}`; // Same property name as above
                row[propName] = { prix: tarif.prix, id: tarif.id }; // Assign the price and ID
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

        // Dynamically add columns for each unique nbrPalette
        this.uniqueNbrPalettes.forEach(palette => {
            this.columns.push({
                prop: `palette${palette}Price`, // Match the property names in the transformed rows
                name: `Palette ${palette}`,
                width: 120
            });
        });
    }

    setMessageValueAfterDelay() {
        setTimeout(() => {
            this.notFoundMessage= "Aucun tarifAff n'a été trouvé"; // Set the variable to "hello" after 5 seconds
        }, 5000);
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
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
        this.router.navigate([`/tarifaff/edit/${tarifId}`]);
    }

    onTransporteurSelect(t: any){
    console.log(t);
    this.fetchTarifAffData(t+0);
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
                        name: 'Tarif Affretement',
                        isLink: false
                    }
                ]
            }
        };

        console.log(this.a)
    }

    protected readonly console = console;
}

