import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { message, save } from "@tauri-apps/plugin-dialog";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useCompaniesFile } from "@/hooks/useCompaniesFile";
import { useFileHistory } from "@/hooks/useRecentFiles";
import { DipendenteConfig } from "@/types/Azienda";
import { XmlFile } from "@/types/XmlFile";
import { buildBancaOreFile, collectFileCodes, derivePeriod } from "@/utils/bancaOre";
import { readAndParseXml, writeXmlFile } from "@/utils/fileUtils";

function File() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");

  const [file, setFile] = useState<XmlFile | null>(null);
  const [fileCodes, setFileCodes] = useState<Set<string | number>>(new Set());
  const [selectedCodes, setSelectedCodes] = useState<Set<string | number>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { config, isLoading: isConfigLoading } = useAppConfig();
  const { config: companyConfig } = useCompaniesFile();
  const { addToFileHistory } = useFileHistory();

  const codiciAziende = useMemo(() => {
    const aziende = file?.Fornitura.Dipendente.map(
      (dipendente) => dipendente["@_CodAziendaUfficiale"],
    );
    return Array.from(new Set(aziende));
  }, [file]);

  const codiciDipendenti = useMemo(() => {
    const dipendenti = file?.Fornitura.Dipendente.map(
      (dipendente) => dipendente["@_CodDipendenteUfficiale"],
    );
    return Array.from(new Set(dipendenti));
  }, [file]);

  const loadedCompany = useMemo(
    () =>
      codiciAziende.map((codice) => companyConfig[codice]).find((azienda) => azienda !== undefined),
    [codiciAziende, companyConfig],
  );

  const loadedEmployees = useMemo(() => {
    if (!loadedCompany) return [];
    return codiciDipendenti
      .map((codice) => loadedCompany.dipendenti[codice])
      .filter((dipendente): dipendente is DipendenteConfig => dipendente !== undefined);
  }, [codiciDipendenti, loadedCompany]);

  // Carica il file solo quando la configurazione è pronta, così il formato date è quello corretto.
  useEffect(() => {
    if (isConfigLoading || !path) return;
    let cancelled = false;

    async function loadFile() {
      try {
        const parsedFile = await readAndParseXml(path);
        if (cancelled || !parsedFile) return;

        const period = derivePeriod(parsedFile.Fornitura.Dipendente, config.dateFormatInput);
        if (!period) return;

        const codes = collectFileCodes(parsedFile.Fornitura.Dipendente);

        setFile(parsedFile);
        setFileCodes(codes);
        setSelectedCodes(codes);
        setStartDate(period.startDate);
        setEndDate(period.endDate);
      } catch (error) {
        console.error("Errore durante la lettura del file XML: ", error);
        if (!cancelled) {
          await message("Impossibile leggere il file XML selezionato.", {
            title: "Errore",
            kind: "error",
          });
        }
      }
    }

    void loadFile();
    return () => {
      cancelled = true;
    };
  }, [path, isConfigLoading, config.dateFormatInput]);

  function toggleCode(code: string | number) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  const formatFullDate = useMemo(
    () =>
      new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  async function saveXmlFile() {
    if (!file || !startDate || !endDate) return;

    try {
      const fileToWrite = buildBancaOreFile({
        file,
        startDate,
        endDate,
        selectedCodes,
        config,
        companyConfig,
      });

      const savePath = await save({
        defaultPath: path?.replace(".xml", "-new.xml"),
        filters: [
          {
            name: "File xml",
            extensions: ["xml"],
          },
        ],
      });

      if (!savePath) return;

      await writeXmlFile(savePath, fileToWrite);
      await message("File salvato con successo.", {
        title: "Successo",
        kind: "info",
      });

      if (path) await addToFileHistory(path);
    } catch (error) {
      console.error("Errore durante il salvataggio del file XML: ", error);
      await message("Errore durante il salvataggio del file XML.", {
        title: "Errore",
        kind: "error",
      });
    }
  }

  return (
    <main className="bg-primary-950 min-h-screen p-8 text-white">
      <div className="flex flex-col items-start justify-center h-full">
        <h1 className="text-2xl mb-4">Elaborazione godimento banca ore</h1>
        <div className="mb-4">
          <h2 className="text-lg mb-2 wrap-break-word">File selezionato: {path}</h2>
        </div>

        <div className="mb-4">
          <h2 className="text-lg mb-2">Dettagli</h2>
          {startDate && (
            <p className="mb-2">
              Data di inizio: {formatFullDate.format(startDate)} (compreso)
            </p>
          )}
          {endDate && (
            <p className="mb-2">
              Data di fine: {formatFullDate.format(endDate)} (escluso)
            </p>
          )}
          {loadedCompany && <p className="mb-2">Aziende: {loadedCompany.denominazione}</p>}
          {loadedEmployees.length > 0 && (
            <p className="mb-2">
              Dipendenti:{" "}
              {loadedEmployees
                .map(
                  (dipendente) =>
                    `${dipendente.nome} ${dipendente.cognome} (${dipendente.codiceFiscale})`,
                )
                .join(", ")}
            </p>
          )}
          <p className="mb-2">Codici ore: {Array.from(fileCodes).join(", ")}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg mb-2">Opzioni</h2>
          <p>Codice banca ore: {config.codeBancaOre}</p>
          <p className="mb-2">Codici da includere nel calcolo:</p>
          <div className="flex flex-col gap-1">
            {Array.from(fileCodes).map((code) => (
              <Checkbox
                key={code.toString()}
                id={`checkbox-${code.toString()}`}
                name={`checkbox-${code.toString()}`}
                label={code}
                checked={selectedCodes.has(code)}
                onChange={() => toggleCode(code)}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={saveXmlFile} disabled={!file || !startDate || !endDate}>
            Salva file XML
          </Button>
          <Link to="/">
            <Button variant="secondary">Chiudi</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default File;
