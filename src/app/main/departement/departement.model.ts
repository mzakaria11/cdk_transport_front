export class Departement {

    id?: number;
    numDepartement: String;
    nom: String;

}

export class LveRequest {
    page: PageInfo = new PageInfo();
    numDepartement: String;
    nom: String;
}

export class PageInfo {
    offset: number = 0;
    size: number = 25;
    limit?: number;
    count?: number;
}

