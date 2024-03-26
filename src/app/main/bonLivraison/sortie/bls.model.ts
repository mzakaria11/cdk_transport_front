import { Article } from "app/main/articles/article/article.model";
import { BCS } from "app/main/bonCommand/sortie/bcs.model";
import { Transporteur } from "app/main/transporteur/transporteur.model";
import { UMS } from "app/main/uniteManutention/sortie/ums.model";

export class BLS {
    id: number;
    dateImpression: Date;
    numeroBonLivraison: String;
    prixExpedition: number;
    codeTracking: String;
    bcs: BCS;
    transporteur: Transporteur;
    lvs: object;
    lignes: LigneBls[];
    umsList: UMS[];
}

export class LigneBls {
    id: number;
    quantiteProduit: number;
    quantiteProduitCommande: String;
    quantiteColis: number;
    quantiteColisCommande: String;
    statQuantitecolis: number;
    statQuantiteproduit: number;
    article: Article;
}

export class BlsRequest {
    page: PageInfo = new PageInfo();
    numeroBl?: string;
    destinataire?: number;
    transporteur?: number;
    dateDebut?: number;
    dateFin?: number;
    dir?: string;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}