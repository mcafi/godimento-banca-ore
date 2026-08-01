import { useCallback } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import { usePersistedJsonFile } from "@/hooks/usePersistedJsonFile";
import { AppConfig } from "@/types/AppConfig";

const defaultConfig: AppConfig = {
  dateFormatInput: "yyyy-MM-dd",
  dateFormatOutput: "yyyy-MM-dd",
  useSameFormatAsInput: true,
  codeBancaOre: "BO",
  includeZeroDays: false,
  defaultWeeklyHours: 40,
};

export function useAppConfig() {
  const {
    data: config,
    update,
    save,
    reset,
    isLoading,
    error,
  } = usePersistedJsonFile<AppConfig>({
    fileName: "config.json",
    defaultData: defaultConfig,
  });

  const updateConfig = useCallback(
    (newConfig: Partial<AppConfig>) => {
      update((prev) => ({ ...prev, ...newConfig }));
    },
    [update],
  );

  const saveConfig = useCallback(async () => {
    if (await save()) {
      await message("Configurazione salvata con successo", {
        title: "Successo",
        kind: "info",
      });
    }
  }, [save]);

  const resetConfig = useCallback(async () => {
    if (await reset()) {
      await message("Configurazione ripristinata ai valori predefiniti", {
        title: "Successo",
        kind: "info",
      });
    }
  }, [reset]);

  return { config, updateConfig, saveConfig, resetConfig, isLoading, error };
}
