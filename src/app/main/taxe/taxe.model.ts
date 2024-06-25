import {Departement} from "../departement/departement.model";
import {Transporteur} from "../transporteur/transporteur.model";

export class Taxe {

    id: number;
    departement : Departement;
    transporteur: Transporteur;
    taxName: string;
    taxValue: number
    taxeName: string;
    letter: string;
    taxType: string;
    fromDate: number;
    toDate: number;

}


export class TaxeRequest {
    id: number;
    transporteurId: number;
    departementId : number;
    taxName: string;
    taxValue: number;
    letter: string;

    taxType: string;
    fromDate: number;
    toDate: number;

}