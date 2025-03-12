import { open, message } from "@tauri-apps/plugin-dialog";

import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { useTranslation } from "react-i18next";

function Home() {
  let navigate = useNavigate();

  const { t } = useTranslation();

  async function openFile() {
    const selectedFile = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "File XML",
          extensions: ["xml"],
        },
      ],
    });

    if (!selectedFile) return;

    if (!selectedFile?.match(/\.xml$/)) {
      await message("Per favore, seleziona un file in formato .xml", {
        title: "Errore",
        kind: "error",
      });
      return;
    }

    navigate(`/file?path=${selectedFile}`);
  }

  return (
    <main className="bg-primary-950 min-h-screen p-4">
      <div className="flex flex-col items-center justify-center h-full py-10 gap-5">
        <Button onClick={openFile}>{t("home.select_file")}</Button>
      </div>
    </main>
  );
}

export default Home;
