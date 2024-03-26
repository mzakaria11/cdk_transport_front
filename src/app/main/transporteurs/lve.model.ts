import { BLE } from "app/main/bonLivraison/entree/ble.model";
import { Transporteur } from "app/main/transporteur/transporteur.model";
import { Observable } from "rxjs";

export class LVE {
    id: number;
    numeroRecepisse: String;
    dateReception: Date;
    quantiteColis: number;
    quantitePalette: number;
    reclamationQuantitecolis: number;
    reclamationQuantitepalette: number;
    reclamationCommentaire: String;
    fichier: String;
    transporteur: Transporteur;   
    bles: BLE[];
}

export class LveRequest {
    page: PageInfo = new PageInfo();
    transporteur?: number;
    operationPalette?: string;
    qtePalette?: number;
    operationColis?: string;
    qteColis?: number;
    dateReceptionDebut?: number;
    dateReceptionFin?: number;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}