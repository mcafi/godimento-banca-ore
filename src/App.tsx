import { open, message } from "@tauri-apps/plugin-dialog";

import "./App.css";
import { useNavigate } from "react-router";

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
    <main className="container">
      <div className="row">
        <button type="button" onClick={openFile}>
          Clicca per selezionare un file
        </button>
      </div>
    </main>
  );
}

export default App;
