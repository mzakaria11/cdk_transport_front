import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {Taxe} from "../taxe.model";
import {TaxeNewService} from "./taxe-new.service";
import {Departement} from "../../departement/departement.model";
import {formatDate} from "@angular/common";
import {FileUploader} from "ng2-file-upload";
import {ColumnMode} from "@swimlane/ngx-datatable";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Observable} from "rxjs";
import {TarifMssNewService} from "../../tarif-mss/tarif-mss-new/tarif-mss-new.service";

@Component({
  selector: 'app-taxe-new',
  templateUrl: './taxe-new.component.html',
  styleUrls: ['./taxe-new.component.scss']
})

export class TaxeNewComponent implements OnInit {
    @ViewChild('newCardModal') newCardModal: TemplateRef<any>;
    fileToUpload: File | null = null;

    transporteurId = 3; // Hardcoded for testing
    formula: string = '';
    cards: any[] = [];
    fileName: string = '';
    transporteurs: any[] = [];
    selectedTransporteurId: string = '';


    newCardData = { taxeName: '', typeAddition: false, typeMultiplication: false, isTemporal: false, fromDate: '', toDate: '' };
    currentCharCode = 65; // ASCII code for 'A'
    constructor(private modalService: NgbModal,
                private httpClient : HttpClient,
                private _tarifMssNewService : TarifMssNewService) {}




    open() {
        this.modalService.open(this.newCardModal).result.then(() => {
            // Modal closed with the "Save" button
        }, () => {
            // Modal dismissed
        });
    }

    loadTransporteurs() {
        this._tarifMssNewService.getTransporteurs().subscribe((data: any[]) => {
            this.transporteurs = data.map(trans => ({
                id: trans.id,
                name: trans.nom // Assuming each object has an 'id' and 'name' property
            }));
            console.log(this.transporteurs)
        });

    }



    optionChanged() {

    }


    typeChanged(selectedType: string) {
        if (selectedType === 'type1' && this.newCardData.typeAddition) {
            this.newCardData.typeMultiplication = false;
        } else if (selectedType === 'type2' && this.newCardData.typeMultiplication) {
            this.newCardData.typeAddition = false;
        }
    }

    addCard() {
        if (this.newCardData.taxeName) {
            if (this.editIndex !== null) {
                this.cards[this.editIndex] = {...this.newCardData}; // Update existing card
                this.editIndex = null; // Reset edit index
            } else {
                const card = {
                    ...this.newCardData,
                    letter: String.fromCharCode(this.currentCharCode + 1) // Convert ASCII code to character
                };
                this.cards.push(card);
                this.currentCharCode = this.currentCharCode >= 90 ? 65 : this.currentCharCode + 1; // Reset or increment the letter
            }
            this.modalService.dismissAll(); // Optionally close the modal
            this.resetForm(); // Reset form after adding/updating a card
        }
    }


    resetForm() {
        this.newCardData = { taxeName: '', typeAddition: false, typeMultiplication: false, isTemporal: false, fromDate: '', toDate: '' };
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
        if (!this.fileToUpload) {
            console.error('No file selected!');
            return;
        }

        // Create a new FormData instance
        const formData = new FormData();

        // Append the file to the FormData instance
        formData.append('file', this.fileToUpload, this.fileName);

        // Append hardcoded transporteurId and formula
        formData.append('transporteurId', this.selectedTransporteurId);
        formData.append('formula', this.formula);  // Adjust if it's supposed to be this.formulaInput

        // Serialize taxDetails from the cards array to match backend expectations
        const taxDetails = this.cards.map(card => {
            let detail = {
                taxName: card.taxeName,
                taxType: card.typeAddition ? 'addition' : 'multiplication',
                letter: card.letter
            };
            // Only include date fields if the temporal option is selected
            if (card.isTemporal) {
                detail['fromDate'] = card.fromDate;
                detail['toDate'] = card.toDate;
            }
            return detail;
        });
        formData.append('taxDetails', JSON.stringify(taxDetails));

        // Make the HTTP request to your server endpoint
        this.httpClient.post(`${environment.api}/taxe/enter`, formData).subscribe({
            next: (response) => {
                console.log('Upload successful', response);
                Swal.fire('Success!', 'The tax details have been uploaded.', 'success');
                window.location.reload(); // Refresh the page to reflect the updated data
            },
            error: (error) => {
                console.error('Upload failed', error);
                Swal.fire('Error!', 'The upload failed.', 'error');
            }
        });
    }


// Assuming you have declared fileToUpload somewhere in your component




    editIndex: number | null = null;

    openEditModal(card: any, index: number) {
        this.newCardData = { ...card }; // Clone the data for editing
        this.editIndex = index; // Track which card is being edited
        this.modalService.open(this.newCardModal).result.then(() => {
            // Save changes on modal close
            this.cards[this.editIndex!] = {...this.newCardData};
            this.resetForm(); // Optionally reset form
        }, () => {
            // Handle modal dismissal
            this.resetForm();
        });
    }

    deleteCard(index: number, event: MouseEvent) {
        event.stopPropagation(); // Prevent opening the edit modal
        this.cards.splice(index, 1); // Remove the card from the array
    }






    ngOnInit(): void {
        this.loadTransporteurs();
  }

  protected readonly ColumnMode = ColumnMode;
  protected readonly document = document;
}

