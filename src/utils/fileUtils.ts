import { XmlFile } from "@/types/XmlFile";
import { readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const xmlParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
};

export async function readAndParseXml(path: string | null): Promise<XmlFile> {

    if (!path) {
        throw new Error("Il percorso del file non è stato specificato");
    }

    const buffer = await readFile(path);
    const xmlString = new TextDecoder().decode(buffer);
    const parser = new XMLParser(xmlParserOptions);
    const result: XmlFile = parser.parse(xmlString);

    return result;
}

export async function writeXmlFile(path: string, xml: XmlFile): Promise<void> {
    const options = { ...xmlParserOptions, format: true, declaration: true };
    const builder = new XMLBuilder(options);

    const newXmlString = builder.build(xml);
    await writeTextFile(path, newXmlString);
}