import { Button } from "../components/Button";
import { open, message, ask } from "@tauri-apps/plugin-dialog";

import Papa from "papaparse";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useCompaniesFile } from "@/hooks/useCompaniesFile";
import { CompanyCSVEntry } from "@/types/CompanyCSVEntry";
import { useAppConfig } from "@/hooks/useAppConfig";

const Companies: React.FC = () => {
  const { config, patchConfig, resetConfig } = useCompaniesFile();
  const { config: appConfig } = useAppConfig();

  const hasCompanies = Object.keys(config).length > 0;

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

    patchConfig(parsed.data as CompanyCSVEntry[], appConfig.defaultWeeklyHours);
  }

  async function handleResetConfig() {
    const confirmed = await ask(
      "Sei sicuro di voler ripristinare la configurazione delle aziende?",
      {
        title: "Conferma reset",
        kind: "warning",
      },
    );
    if (confirmed) {
      resetConfig();
    }
  }

  return (
    <main className="bg-primary-950 min-h-screen p-8 text-white">
      <h1 className="text-2xl font-bold">Aziende e dipendenti</h1>
      <div>
        <div className="my-4">
          <Button onClick={openFile}>Importa file dei dipendenti (formato CSV)</Button>
        </div>
        {hasCompanies && (
          <>
            <h2 className="text-xl font-bold">Elenco aziende</h2>
            {Object.entries(config).map(([codice, azienda]) => (
              <div key={codice}>
                <h3 className="text-lg font-semibold">{azienda.denominazione}</h3>
                <table className="min-w-full table-auto border border-gray-300 my-2">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Identificativo</th>
                      <th className="border-b p-2 text-left">Nome</th>
                      <th className="border-b p-2 text-left">Cognome</th>
                      <th className="border-b p-2 text-left">Codice fiscale</th>
                      <th className="border-b p-2 text-left">Data di assunzione</th>
                      <th className="border-b p-2 text-left">Data di cessazione</th>
                      <th className="border-b p-2 text-left">
                        Ore settimanali (default {appConfig.defaultWeeklyHours})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(azienda.dipendenti).map(([id, dipendente]) => (
                      <tr key={id}>
                        <td className="border-b p-2">{id}</td>
                        <td className="border-b p-2">{dipendente.nome}</td>
                        <td className="border-b p-2">{dipendente.cognome}</td>
                        <td className="border-b p-2">{dipendente.codiceFiscale}</td>
                        <td className="border-b p-2">{dipendente.dataAssunzione}</td>
                        <td className="border-b p-2">{dipendente.dataCessazione}</td>
                        <td className="border-b p-2 text-center">
                          {dipendente.oreSettimanali ?? appConfig.defaultWeeklyHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
        {hasCompanies && (
          <Button variant="danger" onClick={handleResetConfig}>
            Ripristina configurazione
          </Button>
        )}
      </div>
    </main>
  );
};
export default Companies;
