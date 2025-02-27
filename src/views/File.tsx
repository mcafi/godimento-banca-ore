import { readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { XmlFile } from "../types/XmlFile";
import { getEmptyXml } from "../utils/xmlUtils";
import { getDay, parse, addDays, formatDate } from "date-fns";
import { Movimento } from "../types/Movimento";

const File: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");
  const filename = searchParams.get("filename");

  const [file, setFile] = useState<XmlFile | null>(null);

  const [codes, setCodes] = useState<Set<string | number>>(new Set());

  async function readExcelFile() {
    try {
      const fullPath = `${path}\\${filename}`;
      const buffer = await readFile(fullPath);
      const xmlString = new TextDecoder().decode(buffer);
      const xmlParserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      };
      const parser = new XMLParser(xmlParserOptions);
      const result: XmlFile = parser.parse(xmlString);
      console.log("result", result);

      setFile(result);
      const movimenti = result.Fornitura.Dipendente[0].Movimenti.Movimento;
      console.log(movimenti);

      movimenti.forEach((movimento) => {
        codes.add(movimento.CodGiustificativoUfficiale);
      });
    } catch (error) {
      console.error("Errore durante la lettura del file Excel: ", error);
    }
  }

  async function saveXmlFile() {
    try {
      const fullPath = `${path}\\${filename}`;
      const builder = new XMLBuilder({
        attributeNamePrefix: "@_",
        ignoreAttributes: false,
      });

      const newCode = "B0";

      const numberOfDipendenti = file?.Fornitura.Dipendente.length ?? 0;

      const newFile = getEmptyXml();
      newFile.Fornitura.Dipendente = [];

      for (let i = 0; i < numberOfDipendenti; i++) {
        const dipendente = file?.Fornitura.Dipendente[i];

        if (!dipendente) continue;

        const codAziendaUfficiale = dipendente["@_CodAziendaUfficiale"];
        const codDipendenteUfficiale = dipendente["@_CodDipendenteUfficiale"];

        const movimenti = dipendente?.Movimenti.Movimento;

        const newMovimenti: Movimento[] = [];

        if (!movimenti) continue;

        const countOfMovimenti = movimenti.length;

        let currentStartDate: Date | null = null;

        let week = new Array(7).fill(0);

        for (let j = 0; j < countOfMovimenti; j++) {
          const movimento = movimenti[j];
          const date = parse(movimento.Data, "yyyy-MM-dd", new Date());
          const day = getDay(date);

          if (day == 1 && !currentStartDate) {
            currentStartDate = date;
          }

          if (!currentStartDate) continue;

          week[day] += movimento.NumOre;

          if (
            j == countOfMovimenti - 1 ||
            getDay(parse(movimenti[j + 1].Data, "yyyy-MM-dd", new Date())) == 1
          ) {
            const totalHours = week.reduce((acc, curr) => acc + curr, 0);
            console.log("totalHours", totalHours);

            if (totalHours >= 40) {
              for (let k = 0; k < 7; k++) {
                newMovimenti.push({
                  CodGiustificativoUfficiale: newCode,
                  Data: formatDate(
                    addDays(currentStartDate, k - 1),
                    "yyyy-MM-dd"
                  ),
                  NumOre: 0,
                  GiornoDiRiposo: "N",
                  GiornoChiusuraStraordinari: "N",
                });
              }
            } else {
              for (let k = 0; k < 7; k++) {
                newMovimenti.push({
                  CodGiustificativoUfficiale: newCode,
                  Data: formatDate(
                    addDays(currentStartDate, k - 1),
                    "yyyy-MM-dd"
                  ),
                  NumOre: 8 - week[k],
                  GiornoDiRiposo: "N",
                  GiornoChiusuraStraordinari: "N",
                });
              }
            }

            week = new Array(7).fill(0);
            currentStartDate = null;
          }
        }

        console.log("newMovimenti", newMovimenti);

        newFile.Fornitura.Dipendente.push({
          Movimenti: {
            "@_GenerazioneAutomaticaDaTeorico": "N",
            Movimento: newMovimenti,
          },
          "@_CodAziendaUfficiale": codAziendaUfficiale,
          "@_CodDipendenteUfficiale": codDipendenteUfficiale,
        });
      }

      // Costruisci il nuovo XML
      const newXmlString = builder.build(newFile);

      console.log("newXmlString", newXmlString);

      // Salva il nuovo XML nel file
      await writeTextFile(fullPath.replace(".xml", "-new.xml"), newXmlString);
      console.log("File XML salvato con successo.");
    } catch (error) {
      console.error("Errore durante il salvataggio del file XML: ", error);
    }
  }

  useEffect(() => {
    readExcelFile();
  }, []);

  return (
    <div>
      <Link to="/">Back</Link>
      <p>
        File: {path}\{filename}
      </p>
      <p>codici trovati: </p>
      {file && (
        <>
          <ul>
            {Array.from(codes).map((code, index) => (
              <li key={index}>{code}</li>
            ))}
          </ul>
          <button onClick={saveXmlFile}>Save XML</button>
        </>
      )}
    </div>
  );
};

export default File;
