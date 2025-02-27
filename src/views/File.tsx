import { readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { XmlFile } from "../types/XmlFile";
import { getEmptyXml } from "../utils/xmlUtils";
import {
  getDay,
  parse,
  addDays,
  formatDate,
  isBefore,
  differenceInCalendarDays,
} from "date-fns";
import { Movimento } from "../types/Movimento";

import { it } from "date-fns/locale/it";

const File: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");
  const filename = searchParams.get("filename");

  const [file, setFile] = useState<XmlFile | null>(null);

  const [codes, setCodes] = useState<Set<string | number>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);

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

      result.Fornitura.Dipendente.forEach((dipendente) => {
        if (
          dipendente.Movimenti.Movimento &&
          dipendente.Movimenti.Movimento.length > 0
        ) {
          const date = parse(
            dipendente.Movimenti.Movimento[0].Data,
            "yyyy-MM-dd",
            new Date()
          );
          if (!startDate || isBefore(date, startDate)) {
            setStartDate(date);
          }
        }

        dipendente.Movimenti.Movimento?.forEach((movimento) => {
          codes.add(movimento.CodGiustificativoUfficiale);
        });
      });

      if (!startDate) return;

      if (getDay(startDate) != 1) {
        setStartDate(addDays(startDate, 8 - getDay(startDate)));
      }
      console.log(startDate);
      console.log(getDay(startDate));
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

      const newCode = "BO";

      const numberOfDipendenti = file?.Fornitura.Dipendente.length ?? 0;

      const newFile = getEmptyXml();
      newFile.Fornitura.Dipendente = [];

      for (let i = 0; i < numberOfDipendenti; i++) {
        if (!startDate) continue;

        const dipendente = file?.Fornitura.Dipendente[i];

        if (!dipendente) continue;

        const codAziendaUfficiale = dipendente["@_CodAziendaUfficiale"];
        const codDipendenteUfficiale = dipendente["@_CodDipendenteUfficiale"];

        const movimenti = dipendente?.Movimenti.Movimento;

        const newMovimenti: Movimento[] = [];

        if (!movimenti) continue;

        const countOfMovimenti = movimenti.length;

        let currentStartDate: Date = startDate;

        let week = new Array(7).fill(0);

        for (let j = 0; j < countOfMovimenti; j++) {
          const movimento = movimenti[j];
          const date = parse(movimento.Data, "yyyy-MM-dd", new Date());
          const day = getDay(date);

          if (!currentStartDate) continue;

          week[day] += movimento.NumOre;

          if (
            j == countOfMovimenti - 1 ||
            differenceInCalendarDays(
              parse(movimenti[j + 1].Data, "yyyy-MM-dd", new Date()),
              currentStartDate
            ) >= 7
          ) {
            for (let k = 0; k < 7; k++) {
              const reminder = 40 - week.reduce((acc, curr) => acc + curr, 0);

              const hoursToAdd =
                k == 0 || reminder <= 0
                  ? 0
                  : Math.min(Math.max(8 - week[k], 0), Math.max(reminder, 0));

              week[k] += hoursToAdd;

              console.log("reminder", reminder);
              console.log("hoursToAdd", hoursToAdd);
              newMovimenti.push({
                CodGiustificativoUfficiale: newCode,
                Data: formatDate(
                  addDays(currentStartDate, k - 1),
                  "yyyy-MM-dd"
                ),
                NumOre: hoursToAdd,
                GiornoDiRiposo: "N",
                GiornoChiusuraStraordinari: "N",
              });
            }

            week = new Array(7).fill(0);
            currentStartDate = addDays(currentStartDate, 7);
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
    setStartDate(null);
    readExcelFile();
  }, []);

  return (
    <div>
      <Link to="/">Back</Link>
      <p>
        File: {path}\{filename}
      </p>
      {file && (
        <>
          <p>codici trovati: </p>
          <ul>
            {Array.from(codes).map((code, index) => (
              <li key={index}>{code}</li>
            ))}
          </ul>

          <p>
            Data di inizio:{" "}
            {formatDate(startDate, "EEEE d MMMM yyyy", { locale: it })}
          </p>
          <button onClick={saveXmlFile}>Save XML</button>
        </>
      )}
    </div>
  );
};

export default File;
