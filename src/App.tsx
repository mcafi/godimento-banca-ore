import { open, message } from "@tauri-apps/plugin-dialog";

import "./App.css";
import { Link, useNavigate } from "react-router";
import { Button } from "./components/Button";

function App() {
  let navigate = useNavigate();

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
    <main className="bg-neutral-900 min-h-screen p-4">
      <div className="flex flex-col items-center justify-center h-full py-10">
        <Button onClick={openFile}>Clicca per selezionare un file</Button>
        <div>
          <Link to="/settings" className="text-lime-500 hover:underline">
            Impostazioni
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
