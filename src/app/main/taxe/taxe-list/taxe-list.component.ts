import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TaxeNewService} from "../taxe-new/taxe-new.service";
import { Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";



@Component({
  selector: 'app-taxe-list',
  templateUrl: './taxe-list.component.html',
  styleUrls: ['./taxe-list.component.scss'],
})
export class TaxeListComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef,
              private http: HttpClient) { }
  rows = [];
  currentInput = this.createEmptyRow();

  submitRow() {
    const url = `${environment.api}/tariffs/cheapest-transporteur`; // Use your API URL


    const formData = new FormData();

    formData.append('id', "1");
    formData.append('weight', this.currentInput.weight);
    formData.append('palette', this.currentInput.nombrePalette);
    formData.append('destinataire', this.currentInput.destinataireId);


    this.http.post<any>(url, formData).subscribe({

      next: (response) => {
        // Assume response includes { tarifTotal: number, bestTransporteur: string }
        console.log('Response from server:', response);

        // Create a new row with received data and add it to the table
        const newRow = {
          ...this.currentInput, // Current input values
          tarifTotal: response.cheapestTariff, // Response tarifTotal
          bestTransporteur: response.cheapestTransporteurName // Response bestTransporteur
        };

        // Add the new row to the table
        this.rows.push(newRow);

        // Optionally, reset the input form for next entries
        this.currentInput = this.createEmptyRow();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        // Handle errors, perhaps show a user-friendly message
      }
    });


  }


  createEmptyRow() {
    return { weight: '', nombrePalette: '', destinataireId: '', tarifTotal: '', bestTransporteur: '' };
  }

  ngOnInit(): void {
  }}









