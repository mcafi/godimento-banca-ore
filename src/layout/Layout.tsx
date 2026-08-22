import React from "react";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:text-black"
      >
        Vai al contenuto
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
