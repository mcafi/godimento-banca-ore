import { useState, useEffect } from 'react';
import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { message } from "@tauri-apps/plugin-dialog";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { CompanyConfig } from '@/types/CompanyConfig';
import { CompanyCSVEntry } from '@/types/CompanyCSVEntry';

const defaultJson = {};

export function useCompaniesFile() {
    const [config, setConfig] = useState<CompanyConfig>(defaultJson);
    const [configPath, setConfigPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initConfig() {
            try {
                const appDataDir = await appLocalDataDir();

                // Crea la directory se non esiste
                if (!(await exists(appDataDir))) {
                    await mkdir(appDataDir, { recursive: true });
                }

                const configFilePath = await join(appDataDir, "companies.json");
                setConfigPath(configFilePath);

                const fileExists = await exists(configFilePath);

                if (fileExists) {
                    await loadConfig(configFilePath);
                } else {
                    await writeTextFile(configFilePath, JSON.stringify(defaultJson, null, 2));
                    setConfig(defaultJson);
                    setIsLoading(false);
                }
            } catch (err) {
                setError(`Errore durante l'inizializzazione della configurazione: ${err}`);
                setIsLoading(false);
            }
        }

        initConfig();
    }, []);

    async function patchConfig(newEntries: CompanyCSVEntry[]) {

        const updatedConfig = { ...config };

        newEntries.forEach(entry => {
            if (!updatedConfig[entry["Codice azienda"]]) {
                updatedConfig[entry["Codice azienda"]] = {
                    denominazione: entry["Denominazione"],
                    dipendenti: {}
                };
            }
            updatedConfig[entry["Codice azienda"]].dipendenti[entry["Dipendente"]] = {
                nome: entry["Nome"],
                cognome: entry["Cognome"],
                codiceFiscale: entry["Codice fiscale"],
                dataAssunzione: entry["Data assunzione"],
                dataCessazione: entry["Data cessazione"]
            };
        })

        setConfig({ ...updatedConfig });

        await saveConfig({ ...updatedConfig });
    }

    // Carica la configurazione dal file
    async function loadConfig(path: string) {
        try {
            setIsLoading(true);
            setError(null);

            const configContent = await readTextFile(path);
            const parsedConfig = JSON.parse(configContent);

            // Verifica che la configurazione sia valida e integra i valori di default
            const validatedConfig = {
                ...defaultJson,
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
            setConfig(defaultJson);
        } finally {
            setIsLoading(false);
        }
    }

    // Salva la configurazione nel file
    async function saveConfig(newConfig: CompanyConfig) {
        if (!configPath) return;

        try {
            setIsLoading(true);
            setError(null);

            const configString = JSON.stringify(newConfig, null, 2);
            await writeTextFile(configPath, configString);

            console.log(configPath)

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

    // Ripristina la configurazione ai valori predefiniti
    async function resetConfig() {
        try {
            setIsLoading(true);
            setError(null);

            if (!configPath) return;

            setConfig(defaultJson);
            const configString = JSON.stringify(defaultJson, null, 2);
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
        patchConfig,
        saveConfig,
        resetConfig,
        configPath,
        isLoading,
        error
    };
}