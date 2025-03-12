import React from "react";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
