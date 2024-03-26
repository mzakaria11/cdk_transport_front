import {Transporteur} from "../transporteur/transporteur.model";
import {Departement} from "../departement/departement.model";

export class TarifAff {


    id: number;
    departement : Departement;
    transporteur: Transporteur;
    nbrPalette : number;
    prix : number;

}

export class TarifAffRequest {
    id : number;
    transporteurId?: number;
    departementId? : number;
    nbrPalette?: number;
    prix?: number;

}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}



