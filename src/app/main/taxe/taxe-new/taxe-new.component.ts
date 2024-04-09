import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {Taxe} from "../taxe.model";
import {TaxeNewService} from "./taxe-new.service";
import {Departement} from "../../departement/departement.model";
import {formatDate} from "@angular/common";
import {FileUploader} from "ng2-file-upload";
import {ColumnMode} from "@swimlane/ngx-datatable";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-taxe-new',
  templateUrl: './taxe-new.component.html',
  styleUrls: ['./taxe-new.component.scss']
})

export class TaxeNewComponent implements OnInit {
    @ViewChild('newCardModal') newCardModal: TemplateRef<any>;

    cards = [];
    newCardData = { name: '', type1: false, type2: false, option3: false, date: '' };
    currentCharCode = 65; // ASCII code for 'A'
    constructor(private modalService: NgbModal) {}

    open() {
        this.modalService.open(this.newCardModal).result.then(() => {
            // Modal closed with the "Save" button
        }, () => {
            // Modal dismissed
        });
    }



    onOption3Change() {
        // This function is optional unless you need specific logic when Option 3 changes
    }

    optionChanged(optionSelected: string) {

    }


    typeChanged(selectedType: string) {
        if (selectedType === 'type1' && this.newCardData.type1) {
            this.newCardData.type2 = false;
        } else if (selectedType === 'type2' && this.newCardData.type2) {
            this.newCardData.type1 = false;
        }
    }

    addCard() {
        if (this.newCardData.name) {
            const card = {
                ...this.newCardData,
                letter: String.fromCharCode(this.currentCharCode) // Convert ASCII code to character
            };
            this.cards.push(card);
            this.resetForm(); // Reset form after adding a card
            this.currentCharCode = this.currentCharCode >= 90 ? 65 : this.currentCharCode + 1; // Reset or increment the letter
            this.modalService.dismissAll(); // Optionally close the modal
        }
    }

    resetForm() {
        this.newCardData = { name: '', type1: false, type2: false, option3: false, date: '' };
    }

    onAjouterClick() {
        // Implement your logic here
        // This could involve processing the uploaded file, applying the formula, etc.
        console.log('Ajouter clicked');
    }


// Assuming you have declared fileToUpload somewhere in your component
    fileToUpload: File | null = null;
    fileName: string = ''; // To store the selected file's name


    handleFileInput(event: Event) {
        const element = event.currentTarget as HTMLInputElement;
        let fileList: FileList | null = element.files;
        if (fileList && fileList.length > 0) {
            this.fileToUpload = fileList[0];
            this.fileName = fileList[0].name; // Set the file name
        }
    }





    ngOnInit(): void {

  }

  protected readonly ColumnMode = ColumnMode;
  protected readonly document = document;
}

