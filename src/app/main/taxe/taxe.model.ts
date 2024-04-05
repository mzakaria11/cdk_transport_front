import {Departement} from "../departement/departement.model";
import {Transporteur} from "../transporteur/transporteur.model";

export class Taxe {

    id: number;
    departement : Departement;
    transporteur: Transporteur;
    taxeName: string;
    prix: number
    startDate: string;
    endDate: string;
    taxeAfrettement : boolean;
    isCurrency : boolean;
    acceptedDate : boolean;

}


export class TaxeRequest {
    id: number;
    transporteurId: number;
    departementId : number;
    taxeName: string;
    prix: number

}