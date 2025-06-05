// src/hooks/useFileHistory.ts
import { useState, useEffect } from 'react';
import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { appLocalDataDir, join } from "@tauri-apps/api/path";

export type FileHistory = {
    currentFile: string | null;
    history: string[];
}

const defaultHistory: FileHistory = {
    currentFile: null,
    history: []
};

const MAX_HISTORY_ITEMS = 10;

export function useFileHistory() {
    const [fileHistory, setFileHistory] = useState<FileHistory>(defaultHistory);
    const [historyPath, setHistoryPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Inizializza il percorso del file di cronologia e carica la cronologia all'avvio
    useEffect(() => {
        async function initHistory() {
            try {
                const appDataDir = await appLocalDataDir();

                // Crea la directory se non esiste
                if (!(await exists(appDataDir))) {
                    await mkdir(appDataDir, { recursive: true });
                }

                const historyFilePath = await join(appDataDir, "file_history.json");
                setHistoryPath(historyFilePath);

                const fileExists = await exists(historyFilePath);

                if (fileExists) {
                    await loadHistory(historyFilePath);
                } else {
                    await writeTextFile(historyFilePath, JSON.stringify(defaultHistory, null, 2));
                    setFileHistory(defaultHistory);
                    setIsLoading(false);
                }
            } catch (err) {
                setError(`Errore durante l'inizializzazione della cronologia: ${err}`);
                setIsLoading(false);
            }
        }

        initHistory();
    }, []);

    // Carica la cronologia dal file
    async function loadHistory(path: string) {
        try {
            setIsLoading(true);
            setError(null);

            const historyContent = await readTextFile(path);
            const parsedHistory = JSON.parse(historyContent);

            // Verifica che la cronologia sia valida e integra i valori di default
            const validatedHistory = {
                ...defaultHistory,
                ...parsedHistory
            };

            setFileHistory(validatedHistory);
        } catch (err) {
            setError(`Errore durante il caricamento della cronologia: ${err}`);

            // In caso di errore, usa la cronologia predefinita
            setFileHistory(defaultHistory);
        } finally {
            setIsLoading(false);
        }
    }

    // Salva la cronologia nel file
    /*
    async function saveHistory() {
        if (!historyPath) return;

        try {
            setIsLoading(true);
            setError(null);

            const historyString = JSON.stringify(fileHistory, null, 2);
            await writeTextFile(historyPath, historyString);
        } catch (err) {
            setError(`Errore durante il salvataggio della cronologia: ${err}`);
        } finally {
            setIsLoading(false);
        }
    }
        */

    // Aggiunge un file alla cronologia
    async function addFileToHistory(filePath: string) {
        try {
            // Aggiorna il file corrente
            let updatedHistory = [...fileHistory.history];

            // Rimuovi il file dalla cronologia se già presente
            updatedHistory = updatedHistory.filter(path => path !== filePath);

            // Aggiungi il file all'inizio della cronologia
            updatedHistory.unshift(filePath);

            // Limita il numero di elementi nella cronologia
            if (updatedHistory.length > MAX_HISTORY_ITEMS) {
                updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
            }

            const newFileHistory = {
                currentFile: filePath,
                history: updatedHistory
            };

            setFileHistory(newFileHistory);

            // Salva immediatamente la cronologia aggiornata
            if (historyPath) {
                await writeTextFile(historyPath, JSON.stringify(newFileHistory, null, 2));
            }
        } catch (err) {
            setError(`Errore durante l'aggiunta del file alla cronologia: ${err}`);
        }
    }

    // Rimuovi un file dalla cronologia
    async function removeFileFromHistory(filePath: string) {
        try {
            const updatedHistory = fileHistory.history.filter(path => path !== filePath);

            // Aggiorna il file corrente se necessario
            let currentFile = fileHistory.currentFile;
            if (currentFile === filePath) {
                currentFile = updatedHistory.length > 0 ? updatedHistory[0] : null;
            }

            const newFileHistory = {
                currentFile,
                history: updatedHistory
            };

            setFileHistory(newFileHistory);

            // Salva immediatamente la cronologia aggiornata
            if (historyPath) {
                await writeTextFile(historyPath, JSON.stringify(newFileHistory, null, 2));
            }
        } catch (err) {
            setError(`Errore durante la rimozione del file dalla cronologia: ${err}`);
        }
    }

    // Imposta il file corrente
    async function setCurrentFile(filePath: string | null) {
        try {
            // Se il file è null, imposta solo il file corrente a null
            if (filePath === null) {
                const newFileHistory = {
                    ...fileHistory,
                    currentFile: null
                };

                setFileHistory(newFileHistory);

                // Salva immediatamente la cronologia aggiornata
                if (historyPath) {
                    await writeTextFile(historyPath, JSON.stringify(newFileHistory, null, 2));
                }
                return;
            }

            // Altrimenti, aggiungi il file alla cronologia
            await addFileToHistory(filePath);
        } catch (err) {
            setError(`Errore durante l'impostazione del file corrente: ${err}`);
        }
    }

    // Svuota la cronologia
    async function clearHistory() {
        try {
            const newFileHistory = { ...defaultHistory };

            setFileHistory(newFileHistory);

            // Salva immediatamente la cronologia aggiornata
            if (historyPath) {
                await writeTextFile(historyPath, JSON.stringify(newFileHistory, null, 2));
            }
        } catch (err) {
            setError(`Errore durante la pulizia della cronologia: ${err}`);
        }
    }

    return {
        fileHistory,
        currentFile: fileHistory.currentFile,
        history: fileHistory.history,
        addFileToHistory,
        removeFileFromHistory,
        setCurrentFile,
        clearHistory,
        isLoading,
        error
    };
}