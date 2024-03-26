import { BCS } from "app/main/bonCommand/sortie/bcs.model";

export class ScriptStat {
    qteLigneNotRep: number;
    qteLigneRep: number;
    qteLigneDiffEZero: number;
    qteLigneDiffMZero: number;
    totalQteLigne: number;
    totalQteColis: number;
    bcsList: BCS[];
}

export class Stat {
    qteLigneNotRep: number;
    qteLigneRep: number;
    qteLigneDiffEZero: number;
    qteLigneDiffMZero: number;
    totalQteLigne: number;
    totalQteColis: number;
    totalColisDemande: number;
    statut: boolean;
    dateC: Date;
}