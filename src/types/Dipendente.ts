import { Movimento } from "./Movimento";

export type Dipendente = {
    "@_CodAziendaUfficiale": string;
    "@_CodDipendenteUfficiale": string;
    Movimenti: {
        Movimento?: Movimento[]
        "@_GenerazioneAutomaticaDaTeorico": string
    };
}
