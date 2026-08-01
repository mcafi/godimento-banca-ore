import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ask } from "@tauri-apps/plugin-dialog";
import { useFileHistory } from "@/hooks/useRecentFiles";

const FileHistory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fileHistory, clearHistory, checkAllFilesExist, existsMap, isLoading } = useFileHistory();

  useEffect(() => {
    if (!isLoading) {
      void checkAllFilesExist();
    }
  }, [isLoading, checkAllFilesExist]);

  const hasHistory = fileHistory.history.length > 0;

  function handleOpenFile(filePath: string) {
    navigate(`/file?path=${encodeURIComponent(filePath)}`);
  }

  async function handleClearHistory() {
    const confirmed = await ask("Sei sicuro di voler cancellare la cronologia?", {
      title: "Conferma cancellazione",
      kind: "warning",
    });
    if (confirmed) {
      await clearHistory();
    }
  }

  if (isLoading) {
    return (
      <main className="bg-primary-950 min-h-screen p-8 text-white">
        <h1 className="text-2xl font-bold mb-4">{t("file_history")}</h1>
        <p className="text-gray-400">Caricamento...</p>
      </main>
    );
  }

  return (
    <main className="bg-primary-950 min-h-screen p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">{t("file_history")}</h1>

      {!hasHistory ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Nessuno storico recente</p>
          <p className="text-gray-500 text-sm mt-2">I file esportati appariranno qui</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2 mb-6">
            {fileHistory.history.map((filePath, index) => {
              const exists = existsMap.get(filePath) ?? false;

              return (
                <li
                  key={index}
                  className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${exists ? "hover:bg-primary-600 cursor-pointer" : "opacity-50"}
                      transition-colors
                    `}
                  onClick={() => exists && handleOpenFile(filePath)}
                >
                  <div className="flex items-center gap-3">
                    <span title={filePath}>
                      {filePath}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Cancella cronologia
          </button>
        </>
      )}
    </main>
  );
};

export default FileHistory;
