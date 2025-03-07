import { useUserConfig } from "@/hooks/useUserConfig";
import React from "react";
import { Link } from "react-router";
import clsx from "clsx";
import { Button } from "@/components/Button";

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig, saveConfig } = useUserConfig();

  return (
    <main className="bg-neutral-900 min-h-screen p-4 text-white">
      <div className="flex items-center justify-center h-full">
        <Link to="/" className="text-lime-500 hover:underline">
          Indietro
        </Link>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Impostazioni</h2>
        <div>
          <div className="">
            <label htmlFor="inputDateFormat">Formato data input</label>
            <input
              id="inputDateFormat"
              className="block bg-neutral-800 text-white p-2 rounded-lg"
              name="inputDateFormat"
              type="text"
              title="inputDateFormat"
              value={config.dateFormatInput}
              onChange={(e) =>
                updateConfig({ dateFormatInput: e.target.value })
              }
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
              className={clsx(
                "block bg-neutral-800 text-white p-2 rounded-lg",
                { "opacity-50 cursor-not-allowed": config.useSameFormatAsInput }
              )}
              name="outputDateFormat"
              type="text"
              title="outputDateFormat"
              disabled={config.useSameFormatAsInput}
              value={config.dateFormatOutput}
              onChange={(e) =>
                updateConfig({ dateFormatOutput: e.target.value })
              }
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
          <Button onClick={saveConfig}>Salva</Button>
          <Button onClick={resetConfig}>Resetta</Button>
        </div>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </main>
  );
};

export default Settings;
