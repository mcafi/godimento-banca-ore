import { useCallback, useEffect, useRef, useState } from "react";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { message } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

type UsePersistedJsonFileOptions<T> = {
  fileName: string;
  defaultData: T;
  showErrorDialogs?: boolean;
};

/**
 * Carica e salva un file JSON nella directory dati locale dell'app.
 * Gestisce inizializzazione, merge dei default, stato di caricamento ed errori.
 */
export function usePersistedJsonFile<T>({
  fileName,
  defaultData,
  showErrorDialogs = true,
}: UsePersistedJsonFileOptions<T>) {
  const [data, setData] = useState<T>(defaultData);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef<T>(defaultData);
  const defaultDataRef = useRef<T>(defaultData);

  const applyData = useCallback((next: T) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const getData = useCallback(() => dataRef.current, []);

  const reportError = useCallback(
    (context: string, err: unknown) => {
      const errorMessage = `Errore durante ${context}: ${err}`;
      setError(errorMessage);
      if (showErrorDialogs) {
        void message(errorMessage, { title: "Errore", kind: "error" });
      }
    },
    [showErrorDialogs],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const appDataDir = await appLocalDataDir();
        await mkdir(appDataDir, { recursive: true });

        const fullPath = await join(appDataDir, fileName);
        if (cancelled) return;
        setFilePath(fullPath);

        if (await exists(fullPath)) {
          const content = await readTextFile(fullPath);
          const parsed = JSON.parse(content) as T;
          if (!cancelled) applyData({ ...defaultDataRef.current, ...parsed });
        } else {
          await writeTextFile(fullPath, JSON.stringify(defaultDataRef.current, null, 2));
          if (!cancelled) applyData(defaultDataRef.current);
        }
      } catch (err) {
        if (!cancelled) reportError(`l'inizializzazione di ${fileName}`, err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [fileName, applyData, reportError]);

  const writeToDisk = useCallback(
    async (next: T) => {
      if (!filePath) return false;
      applyData(next);
      try {
        await writeTextFile(filePath, JSON.stringify(next, null, 2));
        return true;
      } catch (err) {
        reportError(`il salvataggio di ${fileName}`, err);
        return false;
      }
    },
    [filePath, applyData, reportError, fileName],
  );

  const save = useCallback(
    async (next?: T) => {
      if (!filePath) return false;
      const value = next ?? dataRef.current;
      setIsLoading(true);
      setError(null);
      try {
        applyData(value);
        await writeTextFile(filePath, JSON.stringify(value, null, 2));
        return true;
      } catch (err) {
        reportError(`il salvataggio di ${fileName}`, err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [filePath, applyData, reportError, fileName],
  );

  const update = useCallback(
    (updater: (prev: T) => T) => {
      applyData(updater(dataRef.current));
    },
    [applyData],
  );

  const reset = useCallback(() => save(defaultDataRef.current), [save]);

  return { data, getData, update, save, saveSilently: writeToDisk, reset, isLoading, error };
}
