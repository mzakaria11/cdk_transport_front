import { Article } from "app/main/articles/article/article.model";
import { BLE } from "app/main/bonLivraison/entree/ble.model";
import { ZoneDepot } from "app/main/zoneDepot/zonedepot.model";
import { UMS } from "../sortie/ums.model";

export class UME {
    id: number;
    numero: number;
    dateReception: Date;
    stock: number;
    ble: BLE;
    zoneDepot: ZoneDepot;
    colis: Colis[];
}

export class Colis {
    id: number;
    numeroLot: String;
    datePeremption: Date;
    quantiteProduit: number;
    emplacementConfirme: Date;
    numerotation: String;
    statQuantitecolis: number;
    statQuantiteproduit: number;
    quantiteTotal: number;
    article: Article;
    ume: UME;
    ums: UMS;
    colisStandard:object;
    litigeDecision: object;
    zoneDepot: object;
}

export interface IColisForm {
    idArticle: number,
    code: String;
    designation: String;
    date?: Date;
    numero?: String;
    quantite: number;
    quantiteColisRecue?: number;
    quantiteProduitRecue?: number;
}


export class UmeRequest {
    page: PageInfo = new PageInfo();
    idUme?: number;
    colis?: number;
    numeroLot?: string;
    article?: string;
    ble?: string;
    zone?: string;
    dateStartP?: number;
    dateEndP?: number;
    dateStartR?: number;
    dateEndR?: number;
    operation?: string;
    qte?: number;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}

export class UmeListDTO {
    id: number;
    qte: number;
    dateReception: Date;
    datePeremption: Date;
    numeroLot: string;
    article: string;
    ble: string;
    zone: string;
}


export class ColisRequest {
    page: PageInfo = new PageInfo();
    idDestinataire?: number;
    colis?: number;
    stock?: string;
}