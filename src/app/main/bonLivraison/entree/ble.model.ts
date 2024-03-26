import { Article } from "app/main/articles/article/article.model";
import { Fournisseur } from "app/main/fournisseurs/fournisseur/fournisseur.model";
import { LVE } from "app/main/lettreVoiture/entree/lve.model";
import { UME } from "app/main/uniteManutention/entree/ume.model";

export class BLE {
    id: number;
    dateReception: Date;
    numeroBonLivraison: String;
    quantitePalette: number;
    commentaire: String;
    fichier: String;
    verified: boolean;
    fournisseur: Fournisseur;
    lve: LVE;
    lignes: LigneBle[];
}

export class LigneBle {
    id: number;
    //-------------------------------
    idUme: number;
    numeroUme: number;
    zone: string;
    numeroLot: string;
    //-------------------------------
    quantiteColis: number;
    quantiteColisAlivrer: number;
    quantiteColisLitige: number;
    quantiteColisRecu: number;
    //-------------------------------
    quantiteProduit: number;
    quantiteProduitAlivrer: number;
    quantiteProduitLitige: number;
    quantiteProduitRecu: number;
    //-------------------------------
    quantiteDifferenceAutre: number;
    quantiteDifference: number;
    quantiteDifferenceRestante: number;
    //-------------------------------
    quantiteCommande: number;
    quantiteCommandeRecue: number;
    //-------------------------------
    termine: number;
    controle: number;
    //-------------------------------
    article: Article;
    ume: UME;
}

export class BleRequest {
    page: PageInfo = new PageInfo();
    numeroBl?: string;
    fournisseur?: number;
    operation?: string;
    qtePalette?: number;
    lve?: string;
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