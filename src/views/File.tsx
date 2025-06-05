import { message, save } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useMemo, useState } from "react";
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
  subDays,
  getMonth,
  addWeeks,
  differenceInWeeks,
  differenceInMonths,
} from "date-fns";

import { it } from "date-fns/locale/it";
import { useUserConfig } from "@/hooks/useUserConfig";
import { readAndParseXml, writeXmlFile } from "@/utils/fileUtils";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";

const File: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");

  const [file, setFile] = useState<XmlFile | null>(null);

  const [fileCodes, setFileCodes] = useState<Set<string | number>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedCodes, setSelectedCodes] = useState<Array<string | number>>(
    []
  );

  const codiciAziende = useMemo(() => {
    const aziende = file?.Fornitura.Dipendente.map(
      (dipendente) => dipendente["@_CodAziendaUfficiale"]
    );
    return Array.from(new Set(aziende));
  }, [file]);

  const codiciDipendenti = useMemo(() => {
    const dipendenti = file?.Fornitura.Dipendente.map(
      (dipendente) => dipendente["@_CodDipendenteUfficiale"]
    );
    return Array.from(new Set(dipendenti));
  }, [file]);

  const { config } = useUserConfig();

  async function readExcelFile() {
    try {
      const parsedFile = await readAndParseXml(path);

      if (!parsedFile) return;

      setFile(parsedFile);

      const codes = new Set<string | number>();

      let actualStartDate: Date | null = null;

      parsedFile.Fornitura.Dipendente.forEach((dipendente) => {
        if (
          dipendente.Movimenti.Movimento &&
          dipendente.Movimenti.Movimento.length > 0
        ) {
          const date = parse(
            dipendente.Movimenti.Movimento[0].Data,
            config.dateFormatInput,
            new Date()
          );

          if (!actualStartDate || isBefore(date, actualStartDate)) {
            actualStartDate = date;
          }
        }

        dipendente.Movimenti.Movimento?.forEach((movimento) => {
          codes.add(movimento.CodGiustificativoUfficiale);
        });
      });

      if (!actualStartDate) return;

      const mondayStartDate = subDays(
        actualStartDate,
        getDay(actualStartDate) - 1
      );

      setStartDate(mondayStartDate);

      let endDate = mondayStartDate;

      while (
        getMonth(endDate) === getMonth(mondayStartDate) ||
        differenceInMonths(endDate, actualStartDate) < 1
      ) {
        endDate = addWeeks(endDate, 1);
      }

      setEndDate(endDate);

      setFileCodes(codes);
      setSelectedCodes(Array.from(codes));

      if (!startDate) return;
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
        if (!startDate || !endDate) continue;

        const dipendente = file?.Fornitura.Dipendente[i];

        const weeklyMinutes = 40 * 60;

        if (!dipendente) continue;

        const codAziendaUfficiale = dipendente["@_CodAziendaUfficiale"];
        const codDipendenteUfficiale = dipendente["@_CodDipendenteUfficiale"];

        const movimenti = dipendente?.Movimenti.Movimento;

        const newMovimenti: Movimento[] = [];

        if (!movimenti) continue;

        let currentStartDate: Date = startDate;

        let weeksInterval = differenceInWeeks(endDate, startDate);

        const month = Array.from({ length: weeksInterval }, () =>
          new Array(7).fill(0)
        );

        movimenti.forEach((movimento) => {
          const date = parse(
            movimento.Data,
            config.dateFormatInput,
            new Date()
          );
          const day = getDay(date);

          if (!currentStartDate) return;

          const weeksDifference = differenceInWeeks(date, startDate);

          if (selectedCodes.includes(movimento.CodGiustificativoUfficiale)) {
            month[weeksDifference][day] += movimento.NumOre * 60;
            if (movimento.NumMinuti) {
              month[weeksDifference][day] += movimento.NumMinuti;
            }
          }
        });

        month.forEach((week, index) => {
          for (let k = 0; k < 7; k++) {
            const reminder =
              weeklyMinutes - week.reduce((acc, curr) => acc + curr, 0);

            const dailyHours = 8 * 60;

            const minutesToAdd =
              k == 0 || reminder <= 0
                ? 0
                : Math.min(
                    Math.max(dailyHours - week[k], 0),
                    Math.max(reminder, 0)
                  );

            week[k] += minutesToAdd;

            if (!config.includeZeroDays && minutesToAdd <= 0) continue;

            const hours = Math.floor(minutesToAdd / 60);
            const minutes = minutesToAdd % 60;

            const newMovimento: Movimento = {
              CodGiustificativoUfficiale: newCode,
              Data: formatDate(
                addDays(currentStartDate, index * 7 + k - 1),
                config.dateFormatOutput
              ),
              NumOre: hours,
              GiornoDiRiposo: "N",
              GiornoChiusuraStraordinari: "N",
            };

            if (minutes > 0) {
              newMovimento.NumMinuti = minutes;
            }

            newMovimenti.push(newMovimento);
          }
        });

        newFile.Fornitura.Dipendente.push({
          Movimenti: {
            "@_GenerazioneAutomaticaDaTeorico": "N",
            Movimento: newMovimenti,
          },
          "@_CodAziendaUfficiale": codAziendaUfficiale,
          "@_CodDipendenteUfficiale": codDipendenteUfficiale,
        });
      }

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
    <main className="bg-primary-950 min-h-screen p-4 text-white">
      <div className="flex flex-col items-start justify-center h-full">
        <h1 className="text-2xl mb-4">Elaborazione godimento banca ore</h1>
        <div className="mb-4">
          <h2 className="text-lg mb-2">File selezionato: {path}</h2>
        </div>

        <div className="mb-4">
          <h2 className="text-lg mb-2">Dettagli</h2>
          {startDate && (
            <p className="mb-2">
              Data di inizio:{" "}
              {formatDate(startDate, "EEEE d MMMM yyyy", { locale: it })}{" "}
              (compreso)
            </p>
          )}
          {endDate && (
            <p className="mb-2">
              Data di fine:{" "}
              {formatDate(endDate, "EEEE d MMMM yyyy", { locale: it })}{" "}
              (escluso)
            </p>
          )}
          {codiciAziende && (
            <div>
              <p className="mb-2">Aziende: {codiciAziende.join(", ")}</p>
            </div>
          )}
          {codiciDipendenti && (
            <div>
              <p className="mb-2">Dipendenti: {codiciDipendenti.join(", ")}</p>
            </div>
          )}
          <div>
            <p className="mb-2">
              Codici ore: {Array.from(fileCodes).join(", ")}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg mb-2">Opzioni</h2>
          <p>Ore settimanali: 40</p>
          <p>Codice banca ore: {config.codeBancaOre}</p>
          <p className="mb-2">Codici da includere nel calcolo:</p>
          <div className="flex flex-col gap-1">
            {Array.from(fileCodes).map((code, index) => (
              <Checkbox
                key={index}
                id={`checkbox-${code.toString()}`}
                name={`checkbox-${code.toString()}`}
                label={code}
                checked={selectedCodes.includes(code)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCodes([...selectedCodes, code]);
                  } else {
                    setSelectedCodes(selectedCodes.filter((c) => c !== code));
                  }
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={saveXmlFile}>Salva file XML</Button>
          <Link to="/">
            <Button variant="secondary">Chiudi</Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default File;
