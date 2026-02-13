import { useAppConfig } from "@/hooks/useAppConfig";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/Button";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useTranslation } from "react-i18next";
import { ask } from "@tauri-apps/plugin-dialog";

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig, saveConfig } = useAppConfig();

  const { t } = useTranslation();

  const [appName, setAppName] = useState<string>("");
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    async function fetchAppInfo() {
      try {
        const name = await getName();
        const ver = await getVersion();
        setAppName(name);
        setVersion(ver);
      } catch (error) {
        console.error(
          "Errore durante il recupero delle informazioni dell'app:",
          error,
        );
      }
    }

    fetchAppInfo();
  }, []);

  async function handleResetConfig() {
    const confirmed = await ask(
      "Sei sicuro di voler ripristinare le impostazioni ai valori predefiniti?",
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
    <main className="bg-primary-950 min-h-screen p-5 text-white">
      <h1 className="text-2xl font-bold mb-4">{t("settings")}</h1>
      <div className="flex flex-col gap-4 items-start">
        <div className="">
          <label htmlFor="inputDateFormat">Formato data input</label>
          <input
            id="inputDateFormat"
            className="block bg-neutral-800 text-white p-2 rounded-lg"
            name="inputDateFormat"
            type="text"
            title="inputDateFormat"
            value={config.dateFormatInput}
            onChange={(e) => updateConfig({ dateFormatInput: e.target.value })}
          />
        </div>
        <div className="">
          <input
            id="useSameFormatAsInput"
            className="bg-neutral-800 text-white p-2 rounded-lg size-4 mr-5"
            name="useSameFormatAsInput"
            type="checkbox"
            title="useSameFormatAsInput"
            checked={config.useSameFormatAsInput}
            onChange={(e) =>
              updateConfig({ useSameFormatAsInput: e.target.checked })
            }
          />
          <label htmlFor="useSameFormatAsInput">
            Usa lo stesso formato di input per l'output
          </label>
        </div>
        <div className="">
          <label htmlFor="outputDateFormat">Formato data output</label>
          <input
            id="outputDateFormat"
            className={clsx("block bg-neutral-800 text-white p-2 rounded-lg", {
              "opacity-50 cursor-not-allowed": config.useSameFormatAsInput,
            })}
            name="outputDateFormat"
            type="text"
            title="outputDateFormat"
            disabled={config.useSameFormatAsInput}
            value={config.dateFormatOutput}
            onChange={(e) => updateConfig({ dateFormatOutput: e.target.value })}
          />
        </div>
        <div className="">
          <label htmlFor="codeBancaOre">Codice banca ore</label>
          <input
            id="codeBancaOre"
            className="block bg-neutral-800 text-white p-2 rounded-lg"
            name="codeBancaOre"
            type="text"
            title="codeBancaOre"
            value={config.codeBancaOre}
            onChange={(e) => updateConfig({ codeBancaOre: e.target.value })}
          />
        </div>
        <div className="">
          <input
            id="includeZeroDays"
            className="bg-neutral-800 text-white p-2 rounded-lg size-4 mr-5"
            name="includeZeroDays"
            type="checkbox"
            title="includeZeroDays"
            checked={config.includeZeroDays}
            onChange={(e) =>
              updateConfig({ includeZeroDays: e.target.checked })
            }
          />
          <label htmlFor="includeZeroDays">Includi giorni a zero ore</label>
        </div>
        <div className="">
          <label htmlFor="defaultWeeklyHours">
            Ore settimanali di default (usate in assenza di specifiche per i
            dipendenti)
          </label>
          <input
            id="defaultWeeklyHours"
            className="block bg-neutral-800 text-white p-2 rounded-lg"
            name="defaultWeeklyHours"
            type="text"
            title="defaultWeeklyHours"
            value={config.defaultWeeklyHours}
            onChange={(e) =>
              updateConfig({ defaultWeeklyHours: Number(e.target.value) })
            }
          />
        </div>
        <div className=" flex gap-4">
          <Button onClick={saveConfig}>Salva</Button>
          <Button variant="danger" onClick={handleResetConfig}>
            Resetta
          </Button>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">Informazioni app</h2>
        <p>
          {appName} - Versione {version}
        </p>
      </div>
    </main>
  );
};

export default Settings;
