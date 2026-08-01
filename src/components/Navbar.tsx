import type { ReactNode } from "react";
import clsx from "clsx";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/components/Tooltip";
import { BaselineHistory } from "@/icons/BaselineHistory";
import { OutlineHome } from "@/icons/OutlineHome";
import { OutlinePeople } from "@/icons/OutlinePeople";
import { OutlineSettings } from "@/icons/OutlineSettings";

const Navbar: React.FC = () => {
  const { t } = useTranslation();

  const mainLinks: { to: string; label: string; icon: ReactNode }[] = [
    { to: "/", label: t("title"), icon: <OutlineHome className="size-8" /> },
    {
      to: "/file-history",
      label: t("file_history"),
      icon: <BaselineHistory className="size-8" />,
    },
    {
      to: "/companies",
      label: t("companies"),
      icon: <OutlinePeople className="size-8" />,
    },
  ];

  return (
    <nav className="flex flex-col items-center justify-between p-4 bg-primary-800 text-white">
      <div className="flex flex-col gap-3">
        {mainLinks.map(({ to, label, icon }) => (
          <Tooltip key={to} label={label}>
            <NavLink
              to={to}
              className={({ isActive }) => clsx("text-primary-400", { "text-white": isActive })}
            >
              {icon}
            </NavLink>
          </Tooltip>
        ))}
      </div>
      <Tooltip label={t("settings")}>
        <NavLink
          to="/settings"
          className={({ isActive }) => clsx("text-primary-400", { "text-white": isActive })}
        >
          <OutlineSettings className="size-8" />
        </NavLink>
      </Tooltip>
    </nav>
  );
};

export default Navbar;
