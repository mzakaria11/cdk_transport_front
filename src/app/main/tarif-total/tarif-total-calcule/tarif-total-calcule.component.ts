import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {TarifTotalCalculeService} from "./tarif-total-calcule.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

interface DisplayData {
    unixDate: number;
    destinataire: string;
    idBcs: string;
    weight: string;
    palette: string;
    cheapestTariff: string;
    cheapestTransporteurName: string;
    typeTransporteur: string;
}

interface SendData {
    weight: string;
    nombrePalette: string;
    destinataireId: string;
}

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
                private router: Router,
                private route: ActivatedRoute
                ) { }

    rows = [];
    currentInput = this.createEmptyRow();
    page: number = 0;
    size: number = 5;
    totalElements: number;

    unixDate: number;
    id: string;
    basicDPdata: NgbDateStruct;

    columns = [
        { prop: 'destinataire', name: 'Destinataire', width: 150 },
        { prop: 'idBcs', name: 'ID BCS', width: 80 },
        { prop: 'weight', name: 'Poids', width: 75 },
        { prop: 'palette', name: 'Palettes', width: 85 },
        { prop: 'cheapestTransporteurName', name: 'Transporteur', width: undefined },
        { prop: 'typeTransporteur', name: 'Type de Transporteur', width: 150 }
    ];

    ngOnInit(): void {
        this.contentHeader = {
            headerTitle: 'Liste',
            actionButton: false,
            breadcrumb: {
                type: '',
                links: [
                    { name: 'Accueil', isLink: true, link: '/' },
                    { name: 'Calcule', isLink: true, link: `/ctt/list/${this.unixDate}` }
                ]
            }
        };

        this.route.paramMap.subscribe(params => {
            this.id = params.get('id');
            this.unixDate = +this.id;
        });

        this.toTransport(this.page, this.size);
    }

    forceTableRedraw() {
        this.table.recalculate();
        setTimeout(() => {
            this.rows = [...this.rows];
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
                    destinataire: response.destinataire,
                    idBcs: 'test',
                    weight: this.currentInput.weight,
                    palette: this.currentInput.nombrePalette,
                    cheapestTariff: response.cheapestTariff,
                    cheapestTransporteurName: response.cheapestTransporteurName,
                    typeTransporteur: response.type
                };
                this.rows.push(newRow);
                this.currentInput = this.createEmptyRow();
                this.forceTableRedraw();
            },
            error: (error) => console.error('Error:', error)
        });
    }

    createEmptyRow() {
        return { unixDate: '', expeditionDate: '', destinataireId: '', idBcs: '', weight: '', nombrePalette: '', tarifTotal: '', bestTransporteur: '', typeTransporteur: '' };
    }

    toTransport(page: number, size: number) {
        this.tariffService.getTariffDataByDate(this.unixDate, page, size).subscribe({
            next: (response) => {
                this.rows = response.content;
                this.totalElements = response.totalElements;
                this.forceTableRedraw();
            },
            error: (error) => console.error('Error fetching data:', error)
        });
    }

    setPage(pageInfo: any) {
        this.page = pageInfo.offset;
        this.toTransport(this.page, this.size);
    }

    onPageSizeChanged(event: any) {
        this.size = +event.target.value;
        this.page = 0;
        this.toTransport(this.page, this.size);
    }

    envoieEmail() {
        if (!this.basicDPdata) {
            alert('Please select a date first!');
            return;
        }
        const dateToSend = new Date(this.basicDPdata.year, this.basicDPdata.month - 1, this.basicDPdata.day);
        const formattedDate = `${this.basicDPdata.year}-${this.basicDPdata.month}-${this.basicDPdata.day}`;
        const apiUrl = `${environment.api}/tariffs/sendEmail?unixDate=${this.unixDate}&date=${formattedDate}`;
        this.http.get(apiUrl).subscribe({
            next: (response) => console.log('Emails sent successfully', response),
            error: (error) => console.error('Error sending emails', error)
        });
    }

    confirmExpedition() {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: { confirmButton: 'btn btn-success', cancelButton: 'btn btn-danger sup' },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Vous voulez Vraiment Confirmer L\'expedition ?',
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, Confirmez!',
            cancelButtonText: 'Non, annulez!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.confirm();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Annulé', 'Rien n\'a été confirmer', 'error');
            }
        });
    }

    confirm() {
        const url = `${environment.api}/grouped/confirme/?unixDate=${this.unixDate}`;
        this.http.post(url, null).subscribe(
            response => console.log('Update successful', response),
            error => console.error('Error updating', error)
        );
        this.router.navigate(['/repartition/historique']);
    }

    sendData: SendData[] = [];

    generateAndSendLvs() {
        this.sendData = this.rows.map(row => ({
            weight: row.weight,
            nombrePalette: row.palette,
            destinataireId: row.destinataire
        }));
        const url = `${environment.api}/lvs/generate-lvs`;
        this.http.post(url, this.sendData, { responseType: 'blob' }).subscribe({
            next: (response: Blob) => {
                const blob = new Blob([response], { type: 'application/zip' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'LVS.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);
            },
            error: (error) => console.error('Error generating LVS:', error)
        });
    }

    generateCsv() {
        const url = `${environment.api}/tariffs/generate-csv/?unixDate=${this.unixDate}`;
        this.http.get(url, { responseType: 'blob' }).subscribe((response: any) => {
            const blob = new Blob([response], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'messagerie.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        });
    }

    generateTable() {
        const url = `${environment.api}/tariffs/excel-table/?unixDate=${this.unixDate}`;
        this.http.get(url, { responseType: 'blob' }).subscribe((response: any) => {
            const blob = new Blob([response], { type: 'text/xlsx' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'table.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        });
    }

    generateExcel() {
        const url = `${environment.api}/tariffs/generate-excel/?unixDate=${this.unixDate}`;
        this.http.get(url, { responseType: 'blob' }).subscribe(
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
            }
        );
    }

    public contentHeader: Object;
}
