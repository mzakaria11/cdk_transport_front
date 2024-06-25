import { Component, OnInit } from '@angular/core';
import { TarifMssNewService } from "../tarif-mss-new/tarif-mss-new.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'app-tarif-mss-list',
    templateUrl: './tarif-mss-list.component.html',
    styleUrls: ['./tarif-mss-list.component.scss'],
})
export class TarifMssListComponent implements OnInit {
    rows: any[] = [];
    columns: any[] = [];
    selectedOption: any;
    hasRole: 'Super_admin';
    id: number;
    name: string;
    public contentHeader: object;
    transporteurs: any[] = [];
    public a: any;
    notFoundMessage = "";
    uniqueWeightRanges: string[] = [];

    constructor(private http: HttpClient,
                private router: Router,
                private _tarifMssNewService: TarifMssNewService) { }

    fetchTarifMssData(transporteurId: number) {
        this.http.get<any>(`http://localhost:8080/api/tarifmss/list/${transporteurId}`).subscribe(data => {
            const weightRanges = new Set<string>();

            data.departements.forEach(departement => {
                departement.tarifs.forEach(tarif => {
                    const rangeStr = `${tarif.minKg}-${tarif.maxKg}`;
                    weightRanges.add(rangeStr);
                });
            });

            this.uniqueWeightRanges = Array.from(weightRanges);
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

            this.uniqueWeightRanges.forEach(range => {
                const propName = `range_${range.replace('-', '_')}Price`;
                row[propName] = null;
            });

            departement.tarifs.forEach(tarif => {
                const rangeStr = `${tarif.minKg}-${tarif.maxKg}`;
                const propName = `range_${rangeStr.replace('-', '_')}Price`;
                row[propName] = { id: tarif.id, prix: tarif.prix };
            });

            transformedRows.push(row);
        });

        return transformedRows;
    }

    generateColumns() {
        this.columns = [
            { prop: 'departementName', name: 'Nom du departement', width: 150, sortable: true }
        ];

        this.uniqueWeightRanges.forEach(range => {
            const propName = 'range_' + range.replace('-', '_') + 'Price';
            this.columns.push({
                prop: propName,
                name: `Kg ${range}`,
                width: 120,
                sortable: true
            });
        });
    }

    setMessageValueAfterDelay() {
        setTimeout(() => {
            this.notFoundMessage = "Aucun tarif messagerie n'a été trouvé";
        }, 5000);
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                name: trans.nom
            }));

            this.a = this.transporteurs[0];
            this.onTransporteurSelect(this.a.id);
            this.setMessageValueAfterDelay();
        });
    }

    navigateToDetail(tarifId: number) {
        this.router.navigate([`/tarifmss/edit/${tarifId}`]);
    }

    onTransporteurSelect(t: any) {
        this.fetchTarifMssData(t + 0);
    }

    onSort(event: any) {
        const sort = event.sorts[0];
        const prop = sort.prop;
        const dir = sort.dir;

        this.rows.sort((a, b) => {
            const valA = a[prop]?.prix || a[prop];
            const valB = b[prop]?.prix || b[prop];

            return (valA < valB ? -1 : 1) * (dir === 'asc' ? 1 : -1);
        });
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
    }

    protected readonly console = console;
}
