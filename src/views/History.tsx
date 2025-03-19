import { useFileHistory } from "@/hooks/useRecentFiles";
import { useTranslation } from "react-i18next";

const FileHistory: React.FC = () => {
  const { t } = useTranslation();

  const { fileHistory, addFileToHistory, clearHistory } = useFileHistory();
  return (
    <main className="bg-primary-950 min-h-screen p-4 text-white">
      <h1>{t("file_history")}</h1>
      <div>
        <ul>
          {fileHistory.history.map((file, index) => (
            <li key={index}>
              <button
                onClick={() => addFileToHistory(file)}
                className="text-white"
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};
export default FileHistory;
