import ReactDOM from "react-dom/client";
import App from "./App";
import File from "./views/File";
import { BrowserRouter, Route, Routes } from "react-router";
import Settings from "./views/Settings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/file" element={<File />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);
