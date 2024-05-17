import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { TarifAffNewService } from '../../tarif-aff/tarif-aff-new/tarif-aff-new.service';
import { TarifMssNewService } from '../../tarif-mss/tarif-mss-new/tarif-mss-new.service';

@Component({
    selector: 'app-taxe-new',
    templateUrl: './taxe-new.component.html',
    styleUrls: ['./taxe-new.component.scss']
})
export class TaxeNewComponent implements OnInit {
    @ViewChild('newCardModal') newCardModal: TemplateRef<any>;
    modalRef: NgbModalRef | undefined;
    public contentHeader: Object;

    fileToUpload: File | null = null;
    formula: string = '';
    cards: any[] = [];
    fileName: string = '';
    transporteurs: any[] = [];
    selectedTransporteurId: string = '';

    newCardData: any = {
        taxeName: '',
        typeAddition: false,
        typeMultiplication: false,
        isTemporal: false,
        fromDay: '',
        fromMonth: '',
        toDay: '',
        toMonth: '',
        all: false,
        allValue: '',
        specifier: false,
        departements: [
            { id: '', value: '' }
        ]
    };
    currentCharCode = 66; // ASCII code for 'A'

    months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    departements: any[] = [];

    editIndex: number | null = null;

    constructor(
        private modalService: NgbModal,
        private httpClient: HttpClient,
        private _tarifMssNewService: TarifMssNewService,
        private _tarifAffNewService: TarifAffNewService
    ) {}

    ngOnInit(): void {
        this.loadTransporteurs();
        this.loadDepartements();
        this.contentHeader = {
            headerTitle: 'Nouveau',
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
                        isLink: true,
                        link: '/Taxe/list'
                    },
                    {
                        name: 'Ajouter',
                        isLink: false
                    }
                ]
            }
        };
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                name: trans.nom // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.transporteurs);
        });
    }

    loadDepartements() {
        this._tarifAffNewService.getDepartements().subscribe((data: any[]) => {
            this.departements = data.map(dep => ({
                id: dep.id,
                name: dep.nom
                // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.departements);
        });
    }

    typeChanged(selectedType: string) {
        if (selectedType === 'type1' && this.newCardData.typeAddition) {
            this.newCardData.typeMultiplication = false;
        } else if (selectedType === 'type2' && this.newCardData.typeMultiplication) {
            this.newCardData.typeAddition = false;
        }
    }

    optionChanged() {
        if (!this.newCardData.isTemporal) {
            this.newCardData.fromDay = '';
            this.newCardData.fromMonth = '';
            this.newCardData.toDay = '';
            this.newCardData.toMonth = '';
        }
    }

    allChanged() {
        if (this.newCardData.all) {
            this.newCardData.departements.forEach(dep => {
                dep.value = this.newCardData.allValue;
            });
        }
    }

    specifierChanged() {
        if (!this.newCardData.specifier) {
            this.newCardData.departements = [{ id: '', value: '' }];
        }
    }

    addDepartement() {
        this.newCardData.departements.push({ id: '', value: '' });
    }

    openNewModal() {
        this.resetNewCardData();
        this.modalRef = this.modalService.open(this.newCardModal);
    }

    openEditModal(card: any, index: number) {
        this.newCardData = { ...card }; // Clone the data for editing
        this.editIndex = index; // Track which card is being edited
        this.modalRef = this.modalService.open(this.newCardModal);
        this.modalRef.result.then(() => {
            // Save changes on modal close
            this.cards[this.editIndex!] = { ...this.newCardData };
            this.resetForm(); // Optionally reset form
        }, () => {
            // Handle modal dismissal
            this.resetForm();
        });
    }

    closeModal() {
        if (this.modalRef) {
            this.modalRef.dismiss();
        }
        this.resetNewCardData();
    }

    addCard() {
        if (this.newCardData.taxeName) {
            if (this.editIndex !== null) {
                this.cards[this.editIndex] = { ...this.newCardData }; // Update existing card
                this.editIndex = null; // Reset edit index
            } else {
                const card = {
                    ...this.newCardData,
                    letter: String.fromCharCode(this.currentCharCode) // Convert ASCII code to character
                };
                this.cards.push(card);
                this.currentCharCode = this.currentCharCode >= 90 ? 65 : this.currentCharCode + 1; // Reset or increment the letter
            }
            this.modalService.dismissAll(); // Optionally close the modal
            this.resetForm(); // Reset form after adding/updating a card
        }
    }

    resetNewCardData() {
        this.newCardData = {
            taxeName: '',
            typeAddition: false,
            typeMultiplication: false,
            isTemporal: false,
            fromDay: '',
            fromMonth: '',
            toDay: '',
            toMonth: '',
            all: false,
            allValue: '',
            specifier: false,
            departements: [
                { id: '', value: '' }
            ]
        };
    }

    resetForm() {
        this.resetNewCardData();
        this.editIndex = null;
    }

    handleFileInput(event: Event) {
        const element = event.target as HTMLInputElement;
        let files: FileList | null = element.files;
        if (files && files.length > 0) {
            this.fileToUpload = files[0];
        }
    }

    onAjouterClick() {
        const formData = new FormData();
        formData.append('transporteurId', this.selectedTransporteurId);

        const defaultToZero = (value: any) => (value == null || value === '' || value === undefined) ? 0 : value;


        // Collect tax details
        let taxDetails: any[] = [];
        this.cards.forEach(card => {
            // Set all departments to the general value if "all" is selected
            let allDepartements = this.departements.map(dep => ({
                taxName: card.taxeName,
                taxType: card.typeAddition ? 'addition' : 'multiplication',
                fromDay: defaultToZero(card.fromDay),
                toDay: defaultToZero(card.toDay),
                fromMonth: defaultToZero(card.fromMonth),
                toMonth: defaultToZero(card.toMonth),
                departementId: dep.id,
                taxValue: card.allValue,
                letter: card.letter
            }));

            // Override with specific department values if "specifier" is selected
            if (true) {
                card.departements.forEach(specDep => {
                    let index = allDepartements.findIndex(dep => dep.departementId == specDep.id);
                    if (index !== -1) {
                        allDepartements[index].taxValue = specDep.value;
                    }
                });
            }

            taxDetails.push(...allDepartements);
        });

        formData.append('taxDetails', JSON.stringify(taxDetails));
        formData.append('formula', this.formula);

        console.log(taxDetails);

        this.httpClient.post(`${environment.api}/taxe/enter`, formData).subscribe({
            next: (response) => {
                console.log('Upload successful', response);
                Swal.fire('Success!', 'The tax details have been uploaded.', 'success');
                this.resetForm();
            },
            error: (error) => {
                console.error('Upload failed', error);
                Swal.fire('Error!', 'The upload failed.', 'error');
            }
        });
    }

    deleteCard(index: number, event: MouseEvent) {
        event.stopPropagation(); // Prevent opening the edit modal
        this.cards.splice(index, 1); // Remove the card from the array
    }

    protected readonly ColumnMode = ColumnMode;
    protected readonly document = document;
}
