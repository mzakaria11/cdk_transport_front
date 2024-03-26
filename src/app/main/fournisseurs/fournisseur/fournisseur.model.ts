import { Article } from "app/main/articles/article/article.model";

export class Fournisseur {
    id?: number;
    nom: String;
    email: String;
    telephone: String;
    adresse: String;
    articles?: Article[];
}