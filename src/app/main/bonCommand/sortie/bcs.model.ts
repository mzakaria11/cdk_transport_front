import { Article } from "app/main/articles/article/article.model";
import { BLS } from "app/main/bonLivraison/sortie/bls.model";
import { Destinataire } from "app/main/destinataire/destinataire.model";
import { Transporteur } from "app/main/transporteur/transporteur.model";
import { UMS } from "app/main/uniteManutention/sortie/ums.model";

export class BCS {
    id: number;
    numeroCommande: String;
    dateCommande: Date;
    chorodatage: Date;
    source: String;
    identifiantSource: String;
    termine: number;
    client: Object;
    destinataire: Destinataire;
    transporteur: Transporteur;
    lignes: LigneBcs[];
    blsList: BLS[];
    umsList: UMS[];
    readyForExpedition: boolean;
}

export class LigneBcs {
    id: number;
    quantiteProduitCommande: String;
    quantiteProduitALivrer: number;
    quantiteProduitLivre: number;
    quantiteProduitPotentielle: number;
    quantiteColisCommande: String;
    quantiteColisLivre: number;
    quantiteColisPotentielle: number;
    differenceCommandeLivre: number;
    differenceCommandePotentiel: number;
    statDifferencecommandepotentiel: number;
    termine: number;
    source: String;
    identifiantSource: String;
    article: Article;
}

export class BcsRequest {
    page: PageInfo = new PageInfo();
    numeroCommande?: string;
    destinataire?: number;
    termine?: string;
    dateStart?: number;
    dateEnd?: number;
    dir?: string;
    sort?: string;
}

export class LignBcsRequest {
    page: PageInfo = new PageInfo();
    idArticle?: number;
    stat?: string;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}