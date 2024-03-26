export class RepartitionRequest {
    page: PageInfo = new PageInfo();
    destinataire?: number;
    dir?: string;
    sort?: string;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}

export class Repartition {
    qteLigneNotRep: number;
    qteLigneRep: number;
    qteLigneDiffEZero: number;
    qteLigneDiffMZero: number;
    totalLigne: number;
    totalColisAsignee: number;
    totalColisCommandee: number;
    dateC: Date;
}

export class StatisticRep {
    dateStart?: number;
    dateEnd?: number;
    dateStartExp?: number;
    dateEndExp?: number;
    idArticle?: number;
    idDestinataire?: number;
}