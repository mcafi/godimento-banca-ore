import { Button } from "../components/Button";
import { open, message } from "@tauri-apps/plugin-dialog";

import { useTranslation } from "react-i18next";

import Papa from "papaparse";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useCompaniesFile } from "@/hooks/useCompaniesFile";
import { CompanyCSVEntry } from "@/types/CompanyCSVEntry";

const Companies: React.FC = () => {
  const { t } = useTranslation();

  const { config, patchConfig } = useCompaniesFile();

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

    console.log("File selezionato:", selectedFile);

    const csvContent = await readTextFile(selectedFile as string);
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    patchConfig(parsed.data as CompanyCSVEntry[]);
  }

  return (
    <main className="bg-primary-950 min-h-screen p-4 text-white">
      <h1>Date di assunzione e cessazione</h1>
      <div>
        <Button onClick={openFile}>
          Importa date di assunzione/cessazione
        </Button>
        <div>{JSON.stringify(config, null, 2)}</div>
      </div>
    </main>
  );
};
export default Companies;
