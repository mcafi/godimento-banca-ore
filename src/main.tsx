import ReactDOM from "react-dom/client";
import Home from "./views/Home";
import File from "./views/File";
import { BrowserRouter, Route, Routes } from "react-router";
import Settings from "./views/Settings";
import FileHistory from "./views/History";
import Companies from "./views/Companies";
import Layout from "./layout/Layout";
import "./main.css";

import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/file" element={<File />} />
        <Route path="/file-history" element={<FileHistory />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
