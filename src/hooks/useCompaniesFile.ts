import { useCallback } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import { usePersistedJsonFile } from "@/hooks/usePersistedJsonFile";
import { CompanyConfig } from "@/types/CompanyConfig";
import { CompanyCSVEntry } from "@/types/CompanyCSVEntry";

function buildUpdatedConfig(
  current: CompanyConfig,
  entries: CompanyCSVEntry[],
  defaultWeeklyHours: number,
): CompanyConfig {
  const updated: CompanyConfig = { ...current };

  entries.forEach((entry) => {
    const codiceAzienda = entry["Codice azienda"];
    const codiceDipendente = entry["Dipendente"];

    if (!updated[codiceAzienda]) {
      updated[codiceAzienda] = {
        denominazione: entry["Denominazione"],
        dipendenti: {},
      };
    }

    updated[codiceAzienda].dipendenti[codiceDipendente] = {
      nome: entry["Nome"],
      cognome: entry["Cognome"],
      codiceFiscale: entry["Codice fiscale"],
      dataAssunzione: entry["Data assunzione"],
      dataCessazione: entry["Data cessazione"],
      oreSettimanali: entry["Ore settimanali"] ?? defaultWeeklyHours,
    };
  });

  return updated;
}

export function useCompaniesFile() {
  const {
    data: config,
    getData,
    save,
    reset,
    isLoading,
    error,
  } = usePersistedJsonFile<CompanyConfig>({
    fileName: "companies.json",
    defaultData: {},
  });

  const patchConfig = useCallback(
    async (newEntries: CompanyCSVEntry[], defaultWeeklyHours: number) => {
      const updated = buildUpdatedConfig(getData(), newEntries, defaultWeeklyHours);
      if (await save(updated)) {
        await message("Configurazione salvata con successo", {
          title: "Successo",
          kind: "info",
        });
      }
    },
    [getData, save],
  );

  const resetConfig = useCallback(async () => {
    if (await reset()) {
      await message("Configurazione ripristinata ai valori predefiniti", {
        title: "Successo",
        kind: "info",
      });
    }
  }, [reset]);

  return { config, patchConfig, resetConfig, isLoading, error };
}
