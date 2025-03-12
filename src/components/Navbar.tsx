import { OutlineHome } from "@/icons/OutlineHome";
import { OutlineSettings } from "@/icons/OutlineSettings";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { Tooltip } from "@material-tailwind/react";
import { BaselineHistory } from "@/icons/BaselineHistory";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col items-center justify-between p-4 bg-primary-800 text-white">
      <div className="flex flex-col gap-3">
        <Tooltip
          placement="right"
          className="bg-primary-400 ml-5"
          content={t("title")}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              clsx("text-primary-400", { "text-white": isActive })
            }
            data-tooltip-target="tooltip"
          >
            <OutlineHome className="size-8" />
          </NavLink>
        </Tooltip>
        <Tooltip
          placement="right"
          className="bg-primary-400 ml-5"
          content={t("file_history")}
        >
          <NavLink
            to="/file-history"
            className={({ isActive }) =>
              clsx("text-primary-400", { "text-white": isActive })
            }
          >
            <BaselineHistory className="size-8" />
          </NavLink>
        </Tooltip>
      </div>
      <Tooltip
        placement="right"
        className="bg-primary-400 ml-5"
        content={t("settings")}
      >
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx("text-primary-400", { "text-white": isActive })
          }
        >
          <OutlineSettings className="size-8" />
        </NavLink>
      </Tooltip>
    </nav>
  );
};

export default Navbar;
