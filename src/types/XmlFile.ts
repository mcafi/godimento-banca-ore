import { Dipendente } from "./Dipendente";

export type XmlFile = {
    Fornitura: {
        Dipendente: Dipendente[];
    };
}