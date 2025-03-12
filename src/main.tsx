import ReactDOM from "react-dom/client";
import App from "./App";
import File from "./views/File";
import { BrowserRouter, Route, Routes } from "react-router";
import Settings from "./views/Settings";
import Layout from "./layout/Layout";

import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<App />} />
        <Route path="/file" element={<File />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
