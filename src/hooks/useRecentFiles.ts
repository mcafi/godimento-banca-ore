import { useCallback, useState } from "react";
import { exists } from "@tauri-apps/plugin-fs";
import { usePersistedJsonFile } from "@/hooks/usePersistedJsonFile";

export type FileHistory = {
  history: string[];
};

const defaultHistory: FileHistory = {
  history: [],
};

const MAX_HISTORY_ITEMS = 10;

function addFileToHistory(history: FileHistory, filePath: string): FileHistory {
  const newHistory = [filePath, ...history.history.filter((p) => p !== filePath)].slice(
    0,
    MAX_HISTORY_ITEMS,
  );
  return { history: newHistory };
}

export function useFileHistory() {
  const {
    data: fileHistory,
    getData,
    saveSilently,
    isLoading,
    error,
  } = usePersistedJsonFile<FileHistory>({
    fileName: "file_history.json",
    defaultData: defaultHistory,
    showErrorDialogs: false,
  });

  const [existsMap, setExistsMap] = useState<Map<string, boolean>>(new Map());

  const addToFileHistory = useCallback(
    async (filePath: string) => {
      await saveSilently(addFileToHistory(getData(), filePath));
    },
    [getData, saveSilently],
  );

  const clearHistory = useCallback(async () => {
    await saveSilently(defaultHistory);
  }, [saveSilently]);

  const checkAllFilesExist = useCallback(async (): Promise<Map<string, boolean>> => {
    const current = getData();
    const newMap = new Map<string, boolean>();
    const validFiles: string[] = [];

    for (const filePath of current.history) {
      const fileExists = await exists(filePath).catch(() => false);
      newMap.set(filePath, fileExists);
      if (fileExists) validFiles.push(filePath);
    }

    setExistsMap(newMap);

    if (validFiles.length !== current.history.length) {
      const next: FileHistory = { ...current, history: validFiles };
      await saveSilently(next);
    }
    return newMap;
  }, [getData, saveSilently]);
  return {
    fileHistory,
    existsMap,
    addToFileHistory,
    clearHistory,
    checkAllFilesExist,
    isLoading,
    error,
  };
}
