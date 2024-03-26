import { Fournisseur } from "app/main/fournisseurs/fournisseur/fournisseur.model";

export class Article {
    id: number;
    codeFournisseur: String;
    codeClient: String;
    designationFournisseur: String;
    designationClient: String;
    dureeStockage: number;
    delaiPeremption: number;
    quantiteColisStandard: number;
    quantiteColisStockComplet: number;
    quantiteProduitStockComplet: number;
    stock: number;
    poidsColisStandard: number;
    quantiteUniteManutentionSortie: number;
    quantiteColisStockIncomplet: number;
    quantiteProduitStockIncomplet: number;
    fournisseur: Fournisseur;
    articlesDestinataires: [];
    historiques: [];
}

export class ArticleRequest {
    page: PageInfo = new PageInfo();
    article?: string;
    stock?: boolean;
    operation?: string;
    qte?: number;
    fournisseur?: number;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}