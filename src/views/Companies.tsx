import { Button } from "../components/Button";
import { open, message } from "@tauri-apps/plugin-dialog";

import Papa from "papaparse";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useCompaniesFile } from "@/hooks/useCompaniesFile";
import { CompanyCSVEntry } from "@/types/CompanyCSVEntry";
import { useMemo } from "react";

const Companies: React.FC = () => {
  const { config, patchConfig, resetConfig } = useCompaniesFile();

  async function openFile() {
    const selectedFile = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "File CSV",
          extensions: ["csv"],
        },
      ],
    });

    if (!selectedFile) return;

    if (!selectedFile?.match(/\.csv$/)) {
      await message("Per favore, seleziona un file in formato .csv", {
        title: "Errore",
        kind: "error",
      });
      return;
    }

    const csvContent = await readTextFile(selectedFile as string);
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    patchConfig(parsed.data as CompanyCSVEntry[]);
  }

  const hasCompanies = useMemo(() => {
    return Object.keys(config).length > 0;
  }, [config]);

  return (
    <main className="bg-primary-950 min-h-screen p-4 text-white">
      <h1 className="text-2xl font-bold">Aziende e dipendenti configurati</h1>
      <div>
        <div className="my-4">
          <Button onClick={openFile}>
            Clicca per importare un file (formato CSV)
          </Button>
        </div>
        {hasCompanies && (
          <>
            <h2 className="text-xl font-bold">Elenco aziende</h2>
            {Object.keys(config).map((azienda) => (
              <div key={azienda}>
                <h3 className="text-lg font-semibold">
                  {config[azienda].denominazione}
                </h3>
                <table className="min-w-full table-auto border border-gray-300 my-2">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Identificativo</th>
                      <th className="border-b p-2 text-left">Nome</th>
                      <th className="border-b p-2 text-left">Cognome</th>
                      <th className="border-b p-2 text-left">
                        Data di assunzione
                      </th>
                      <th className="border-b p-2 text-left">
                        Data di cessazione
                      </th>
                      <th className="border-b p-2 text-left">
                        Ore settimanali
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(config[azienda].dipendenti).map((id) => (
                      <tr key={id}>
                        <td className="border-b p-2">{id}</td>
                        <td className="border-b p-2">
                          {config[azienda].dipendenti[id].nome}
                        </td>
                        <td className="border-b p-2">
                          {config[azienda].dipendenti[id].cognome}
                        </td>
                        <td className="border-b p-2">
                          {config[azienda].dipendenti[id].dataAssunzione}
                        </td>
                        <td className="border-b p-2">
                          {config[azienda].dipendenti[id].dataCessazione}
                        </td>
                        <td className="border-b p-2">
                          {config[azienda].dipendenti[id].oreSettimanali}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
        <Button onClick={resetConfig}>Ripristina configurazione</Button>
      </div>
    </main>
  );
};
export default Companies;
