import { XmlFile } from "../types/XmlFile"

export const getEmptyXml = () => {
    return {
        Fornitura: {
            Dipendente: []
        }
    } as XmlFile
}