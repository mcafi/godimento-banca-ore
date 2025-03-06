import { message, save } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { XmlFile } from "../types/XmlFile";
import { Movimento } from "../types/Movimento";
import { getEmptyXml } from "@utils/xmlUtils";
import {
  getDay,
  parse,
  addDays,
  formatDate,
  isBefore,
  differenceInCalendarDays,
} from "date-fns";

import { it } from "date-fns/locale/it";
import { useUserConfig } from "@/hooks/useUserConfig";
import { readAndParseXml, writeXmlFile } from "@/utils/fileUtils";

const File: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");

  const [file, setFile] = useState<XmlFile | null>(null);

  const [fileCodes, setFileCodes] = useState<Set<string | number>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);

  const [selectedCodes, setSelectedCodes] = useState<Array<string | number>>(
    []
  );

  const { config } = useUserConfig();

  async function readExcelFile() {
    try {
      const parsedFile = await readAndParseXml(path);

      if (!parsedFile) return;

      setFile(parsedFile);

      const codes = new Set<string | number>();

      parsedFile.Fornitura.Dipendente.forEach((dipendente) => {
        if (
          dipendente.Movimenti.Movimento &&
          dipendente.Movimenti.Movimento.length > 0
        ) {
          const date = parse(
            dipendente.Movimenti.Movimento[0].Data,
            config.dateFormat,
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

      setFileCodes(codes);
      setSelectedCodes(Array.from(codes));

      if (!startDate) return;

      if (getDay(startDate) != 1) {
        setStartDate(addDays(startDate, 8 - getDay(startDate)));
      }
    } catch (error) {
      console.error("Errore durante la lettura del file Excel: ", error);
    }
  }

  async function saveXmlFile() {
    try {
      const fullPath = `${path}`;
      const newCode = config.codeBancaOre;

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

          const date = parse(movimento.Data, config.dateFormat, new Date());
          const day = getDay(date);

          if (!currentStartDate) continue;

          if (selectedCodes.includes(movimento.CodGiustificativoUfficiale)) {
            week[day] += movimento.NumOre;
          }

          if (
            j == countOfMovimenti - 1 ||
            differenceInCalendarDays(
              parse(movimenti[j + 1].Data, config.dateFormat, new Date()),
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

              if (!config.includeZeroDays && hoursToAdd <= 0) continue;

              newMovimenti.push({
                CodGiustificativoUfficiale: newCode,
                Data: formatDate(
                  addDays(currentStartDate, k - 1),
                  config.dateFormat
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

      const savePath = await save({
        defaultPath: fullPath.replace(".xml", "-new.xml"),
        filters: [
          {
            name: "File xml",
            extensions: ["xml"],
          },
        ],
      });

      if (!savePath) return;

      // Salva il nuovo XML nel file
      await writeXmlFile(savePath, newFile);

      message("File salvato con successo.", {
        title: "Successo",
        kind: "info",
      });
    } catch (error) {
      console.error("Errore durante il salvataggio del file XML: ", error);
      message("Errore durante il salvataggio del file XML.", {
        title: "Errore",
        kind: "error",
      });
    }
  }

  useEffect(() => {
    setStartDate(null);
    readExcelFile();
  }, []);

  return (
    <main className="bg-neutral-900 min-h-screen p-4 text-white">
      <div className="flex flex-col items-start justify-center h-full">
        <div className="mb-4">
          <Link to="/">&larr; Torna alla schermata iniziale</Link>
        </div>
        <h2 className="text-xl mb-2">File: {path}</h2>
        {file && (
          <div className="mb-2">
            {startDate && (
              <p className="mb-2">
                Data di inizio:{" "}
                {formatDate(startDate, "EEEE d MMMM yyyy", { locale: it })}
              </p>
            )}
            <div className="mb-4">
              <p className="mb-2">
                Seleziona i codici da includere nel calcolo:{" "}
              </p>
              <div className="flex flex-col gap-1">
                {Array.from(fileCodes).map((code, index) => (
                  <div className="mb-2 flex items-center" key={index}>
                    <input
                      type="checkbox"
                      className="accent-lime-800 size-6 hover:cursor-pointer"
                      name={"checkbox-" + code.toString()}
                      id={"checkbox-" + code.toString()}
                      checked={selectedCodes.includes(code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCodes([...selectedCodes, code]);
                        } else {
                          setSelectedCodes(
                            selectedCodes.filter((c) => c !== code)
                          );
                        }
                      }}
                    />
                    <label
                      className="px-3 hover:cursor-pointer"
                      htmlFor={"checkbox-" + code.toString()}
                    >
                      {code}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="text-white bg-lime-900 px-4 py-2 rounded-lg hover:cursor-pointer drop-shadow-[0_0_15px_rgba(25,46,3,0)] hover:drop-shadow-[0_0_15px_rgb(25,46,3)] transition-all"
              onClick={saveXmlFile}
            >
              Salva file XML
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default File;
