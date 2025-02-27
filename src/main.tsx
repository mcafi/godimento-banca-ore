import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import File from "./views/File";
import { BrowserRouter, Route, Routes } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/file" element={<File />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
