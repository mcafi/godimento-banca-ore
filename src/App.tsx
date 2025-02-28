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
    <main className="bg-neutral-900 min-h-screen p-4">
      <div className="flex items-center justify-center h-full py-10">
        <button
          className="text-white bg-lime-900 px-4 py-2 rounded-lg hover:cursor-pointer drop-shadow-[0_0_15px_rgba(25,46,3,0)] hover:drop-shadow-[0_0_15px_rgb(25,46,3)] transition-all"
          type="button"
          onClick={openFile}
        >
          Clicca per selezionare un file
        </button>
      </div>
    </main>
  );
}

export default App;
