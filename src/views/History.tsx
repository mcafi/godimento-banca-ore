import { useTranslation } from "react-i18next";

const FileHistory: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main className="bg-primary-950 min-h-screen p-4 text-white">
      <h1>{t("file_history")}</h1>
    </main>
  );
};
export default FileHistory;
