import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormGroup, Validators} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthenticationService } from 'app/auth/service';
import {Subject, Subscription} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {TarifMss} from "../tarif-mss.model";
import {TarifMssListService} from "../tarif-mss-list/tarif-mss-list.service";
import {TarifMssDetailService} from "../tarif-mss-detail/tarif-mss-detail.service";
import {Transporteur} from "../../transporteur/transporteur.model";
import {TarifMssNewService} from "../tarif-mss-new/tarif-mss-new.service";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

interface TarifAffResponse {
    departements: Array<{
        departementName: string;
        departementId: number;
        tarifs: Array<{ minKg: number; maxKg: number; prix: number; id: number}>;
    }>;
    transporteurId: number;

}

@Component({
  selector: 'app-tarif-mss-list',
  templateUrl: './tarif-mss-list.component.html',
  styleUrls: ['./tarif-mss-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TarifMssListComponent implements OnInit {

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









    uniqueWeightRanges: string[] = [];

    fetchTarifMssData(transporteurId: number) {
        this.http.get<any>(`http://localhost:8080/api/tarifmss/list/${transporteurId}`).subscribe(data => {
            const weightRanges = new Set<string>();

            data.departements.forEach(departement => {
                departement.tarifs.forEach(tarif => {
                    // Format the range string as 'minKg-maxKg', e.g., '1-9'
                    const rangeStr = `${tarif.minKg}-${tarif.maxKg}`;
                    weightRanges.add(rangeStr);
                });
            });

            // Convert the Set to an array and store it for use in the template
            this.uniqueWeightRanges = Array.from(weightRanges);

            // Now, process the data to fit the ngx-datatable format
            this.rows = this.transformDataForTable(data);

            // Generate columns based on unique weight ranges
            this.generateColumns();
        });
    }

    transformDataForTable(data: any): any[] {
        // Initialize an empty array to hold the transformed rows
        let transformedRows = [];

        // Iterate over each departement in the data
        data.departements.forEach(departement => {
            // Create a base object for the departement row, including its name and ID
            let row = {
                departementName: departement.departementName,
                departementId: departement.departementId
            };

            // Initialize properties for each unique weight range with default values (e.g., null or 0)
            this.uniqueWeightRanges.forEach(range => {
                const propName = `range_${range.replace('-', '_')}Price`;
                row[propName] = null; // Initialize with null or a suitable default value
            });

            // Populate the row object with actual prices for each tarif's weight range
            departement.tarifs.forEach(tarif => {
                const rangeStr = `${tarif.minKg}-${tarif.maxKg}`;
                const propName = `range_${rangeStr.replace('-', '_')}Price`;
                row[propName] = { id: tarif.id, prix: tarif.prix };;
            });

            // Add the fully populated row object to the transformedRows array
            transformedRows.push(row);
        });

        // Return the array of transformed row objects
        return transformedRows;
    }

    generateColumns() {
        // Start with fixed columns
        this.columns = [
            { prop: 'departementName', name: 'Nom du departement', width: 150 }
        ];

        // Add a column for each unique weight range
        this.uniqueWeightRanges.forEach(range => {
            const propName = 'range_' + range.replace('-', '_') + 'Price'; // Ensure the transformed data has properties that match this naming convention
            this.columns.push({
                prop: propName,
                name: `Kg ${range}`,
                width: 120
            });
        });
    }

    setMessageValueAfterDelay() {
        setTimeout(() => {
            this.notFoundMessage= "Aucun tarif messagerie n'a été trouvé"; // Set the variable to "hello" after 5 seconds
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
        this.router.navigate([`/tarifmss/edit/${tarifId}`]);
    }

    onTransporteurSelect(t: any){
        console.log(t);
        this.fetchTarifMssData(t+0);
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
                        name: 'Tarif Messagerie',
                        isLink: false
                    }
                ]
            }
        };

        console.log(this.a)
    }

    protected readonly console = console;
}

