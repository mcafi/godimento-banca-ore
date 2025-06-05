import { useState, useEffect } from 'react';
import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { message } from "@tauri-apps/plugin-dialog";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { UserConfig } from '@/types/UserConfig';

const defaultConfig: UserConfig = {
    dateFormatInput: "yyyy-MM-dd",
    dateFormatOutput: "yyyy-MM-dd",
    useSameFormatAsInput: true,
    codeBancaOre: "BO",
    includeZeroDays: false,
    companies: {},
    employers: {},
};

export function useUserConfig() {
    const [config, setConfig] = useState<UserConfig>(defaultConfig);
    const [configPath, setConfigPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Inizializza il percorso del file di configurazione e carica la configurazione all'avvio
    useEffect(() => {
        async function initConfig() {
            try {
                const appDataDir = await appLocalDataDir();

                // Crea la directory se non esiste
                if (!(await exists(appDataDir))) {
                    await mkdir(appDataDir, { recursive: true });
                }

                const configFilePath = await join(appDataDir, "config.json");
                setConfigPath(configFilePath);

                const fileExists = await exists(configFilePath);

                if (fileExists) {
                    await loadConfig(configFilePath);
                } else {
                    await writeTextFile(configFilePath, JSON.stringify(defaultConfig, null, 2));
                    setConfig(defaultConfig);
                    setIsLoading(false);
                }
            } catch (err) {
                setError(`Errore durante l'inizializzazione della configurazione: ${err}`);
                setIsLoading(false);
            }
        }

        initConfig();
    }, []);

    // Carica la configurazione dal file
    async function loadConfig(path: string) {
        try {
            setIsLoading(true);
            setError(null);

            const configContent = await readTextFile(path);
            const parsedConfig = JSON.parse(configContent);

            // Verifica che la configurazione sia valida e integra i valori di default
            const validatedConfig = {
                ...defaultConfig,
                ...parsedConfig
            };

            setConfig(validatedConfig);
        } catch (err) {
            setError(`Errore durante il caricamento della configurazione: ${err}`);
            await message(`Errore durante il caricamento della configurazione: ${err}`, {
                title: "Errore",
                kind: "error",
            });

            // In caso di errore, usa la configurazione predefinita
            setConfig(defaultConfig);
        } finally {
            setIsLoading(false);
        }
    }

    // Salva la configurazione nel file
    async function saveConfig() {
        if (!configPath) return;

        try {
            setIsLoading(true);
            setError(null);

            const configString = JSON.stringify(config, null, 2);
            await writeTextFile(configPath, configString);

            await message("Configurazione salvata con successo", {
                title: "Successo",
                kind: "info",
            });
        } catch (err) {
            setError(`Errore durante il salvataggio della configurazione: ${err}`);
            await message(`Errore durante il salvataggio della configurazione: ${err}`, {
                title: "Errore",
                kind: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Aggiorna la configurazione in memoria
    function updateConfig(newConfig: Partial<UserConfig>) {
        setConfig({ ...config, ...newConfig });
    }

    // Ripristina la configurazione ai valori predefiniti
    async function resetConfig() {
        try {
            setIsLoading(true);
            setError(null);

            if (!configPath) return;

            setConfig(defaultConfig);
            const configString = JSON.stringify(defaultConfig, null, 2);
            await writeTextFile(configPath, configString);

            await message("Configurazione ripristinata ai valori predefiniti", {
                title: "Successo",
                kind: "info",
            });
        } catch (err) {
            setError(`Errore durante il ripristino della configurazione: ${err}`);
            await message(`Errore durante il ripristino della configurazione: ${err}`, {
                title: "Errore",
                kind: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return {
        config,
        updateConfig,
        saveConfig,
        resetConfig,
        configPath,
        isLoading,
        error
    };
}