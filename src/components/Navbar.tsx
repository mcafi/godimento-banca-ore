import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col items-center justify-between p-4 bg-primary-800 text-white">
      <Link to="/" className="text-xl font-bold">
        {t("title")}
      </Link>
      <Link to="/settings" className="text-primary-200 hover:underline">
        {t("settings")}
      </Link>
    </nav>
  );
};

export default Navbar;
