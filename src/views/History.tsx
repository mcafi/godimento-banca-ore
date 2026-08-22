import { useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ask } from "@tauri-apps/plugin-dialog";
import { useFileHistory } from "@/hooks/useRecentFiles";
import { Button } from "@/components/Button";

const FileHistory: React.FC = () => {
  const { t } = useTranslation();
  const { fileHistory, clearHistory, checkAllFilesExist, existsMap, isLoading } = useFileHistory();

  useEffect(() => {
    if (!isLoading) {
      void checkAllFilesExist();
    }
  }, [isLoading, checkAllFilesExist]);

  const hasHistory = fileHistory.history.length > 0;

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
        <p className="text-gray-400">Caricamento…</p>
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
                    ${exists ? "hover:bg-primary-600" : "opacity-50"}
                    transition-colors
                  `}
                >
                  <Link
                    to={`/file?path=${encodeURIComponent(filePath)}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                    tabIndex={exists ? 0 : -1}
                    aria-disabled={!exists}
                    onClick={(e) => {
                      if (!exists) e.preventDefault();
                    }}
                  >
                    <span title={filePath} className="truncate">
                      {filePath}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button variant="danger" onClick={handleClearHistory}>
            Cancella cronologia
          </Button>
        </>
      )}
    </main>
  );
};

export default FileHistory;
