import { useUserConfig } from "@/hooks/useUserConfig";
import React from "react";
import { Link } from "react-router";

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig, saveConfig } = useUserConfig();

  return (
    <main className="bg-neutral-900 min-h-screen p-4 text-white">
      <div className="flex items-center justify-center h-full py-10">
        <Link to="/" className="text-lime-500 hover:underline">
          Indietro
        </Link>
      </div>
      <div>
        <h2>Impostazioni attuali</h2>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </main>
  );
};

export default Settings;
