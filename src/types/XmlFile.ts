import { Dipendente } from "./Dipendente";

export type XmlFile = {
    "?xml": {
        "@_version": string;
        "@_encoding": string;
    };
    Fornitura: {
        Dipendente: Dipendente[];
    };
}