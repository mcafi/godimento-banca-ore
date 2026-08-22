import ReactDOM from "react-dom/client";
import Home from "./views/Home";
import File from "./views/File";
import { createBrowserRouter, RouterProvider } from "react-router";
import Settings from "./views/Settings";
import FileHistory from "./views/History";
import Companies from "./views/Companies";
import Layout from "./layout/Layout";
import "./main.css";

import "./i18n";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "file", element: <File /> },
      { path: "file-history", element: <FileHistory /> },
      { path: "companies", element: <Companies /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />,
);
