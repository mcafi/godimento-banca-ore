import { useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { DirEntry, readDir, readFile } from "@tauri-apps/plugin-fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

import "./App.css";
import { useNavigate } from "react-router";

function App() {
  const [folderPath, setFolderPath] = useState("");
  const [files, setFiles] = useState<DirEntry[]>([]);

  let navigate = useNavigate();

  const fileList = useMemo(() => {
    return files.filter((file) => file.name.match(/.*\.xml$/));
  }, [files]);

  async function openFolder() {
    const selectedFolder = await open({ directory: true });
    if (typeof selectedFolder === "string") {
      setFolderPath(selectedFolder);
      listFiles(selectedFolder);
    }
  }

  async function listFiles(path: string) {
    try {
      const entries = await readDir(path);
      setFiles(entries);
    } catch (error) {
      console.error("Errore durante la lettura della cartella: ", error);
    }
  }

  return (
    <main className="container">
      <div className="row">
        <button type="button" onClick={openFolder}>
          Open Folder
        </button>
      </div>
      {folderPath && <p>Selected Folder: {folderPath}</p>}
      {files.length > 0 && (
        <ul>
          {fileList.map((file, index) => (
            <li
              onClick={() =>
                navigate(`/file?path=${folderPath}&filename=${file.name}`)
              }
              key={index}
            >
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
