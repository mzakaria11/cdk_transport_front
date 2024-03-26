import {Departement} from "../departement/departement.model";
import {Transporteur} from "../transporteur/transporteur.model";

export class TarifMss {


    id : number;
    departement : Departement;
    transporteur: Transporteur;
    minKg : number;
    maxKg : number;
    prix : number;

}

export class TarifMssRequest {
    id : number;
    transporteurId: number;
    departementId : number;
    minKg: number;
    maxKg: number;
    prix: number;

}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}
