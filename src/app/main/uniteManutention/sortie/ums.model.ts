import { Article } from "app/main/articles/article/article.model";
import { BCS } from "app/main/bonCommand/sortie/bcs.model";
import { BLS } from "app/main/bonLivraison/sortie/bls.model";
import { UME } from "../entree/ume.model";

export class UMS {
    id: number;

    numero: number;

    dateOuverture: Date;

    dateFermeture: Date;

    dateExpedition: Date;

    poidsBrut: number;

    poidsNet: number;

    poidsTare: number;

    poidsDifference: number;

    statPoidsbrut: number;

    bls: BLS;

    bcs: BCS;
    
    colisList: ColisList[];
}

export class ColisList {
    id: number;
    numeroLot: String;
    quantiteProduit: number;
    datePeremption: Date;
    emplacementConfirme: Date;
    article: Article;
    ume: UME;
}

export class UmsRequest {
    page: PageInfo = new PageInfo();
    operation?: string;
    poid?: number;
    destinataire?: number;
    stat?: string;
    dateStartOuv?: number;
    dateEndOuv?: number;
    dateStartFer?: number;
    dateEndFer?: number;
    dateStartExp?: number;
    dateEndExp?: number;
    dir?: string;
    sort?: string;
}

export class ColisListRequest {
    page: PageInfo = new PageInfo();
    article?: string;
    stat?: string;
    numerotation?: string;
    idColis?: number;
    lot?: string;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}