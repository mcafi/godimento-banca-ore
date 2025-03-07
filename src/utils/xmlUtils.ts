import { XmlFile } from "../types/XmlFile"

export const getEmptyXml = () => {
    return {
        "?xml": {
            "@_version": "1.0",
            "@_encoding": "UTF-8"
        },
        Fornitura: {
            Dipendente: []
        }
    } as XmlFile
}