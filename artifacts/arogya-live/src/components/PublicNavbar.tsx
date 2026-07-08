import { Link } from "wouter";
import {
  Home,
  Hospital,
  Stethoscope,
  Megaphone,
  PhoneCall,
  LogIn,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";

export default function PublicNavbar() {
  const { t } = useTranslation();

  return (
    <nav
  className="
    w-full
    h-16
    flex
    items-center
    justify-between
    px-6
    bg-white
  "
>
    

      {/* Logo + Navigation */}
      <div className="flex items-center gap-8 overflow-x-auto">

        {/* ArogyaLive Logo */}
        <Link
          href="/"
          className="
            text-2xl
            font-bold
            text-blue-600
            whitespace-nowrap
            mr-4
          "
        >
          ArogyaLive
        </Link>


        {/* Home */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          <Home className="h-5 w-5 text-blue-600" />
          <span>{t("home")}</span>
        </Link>


        {/* Health Centres */}
        <a
          href="#about"
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          <Hospital className="h-5 w-5 text-red-500" />
          <span>{t("health_centres")}</span>
        </a>


        {/* Services */}
        <a
          href="#services"
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          <Stethoscope className="h-5 w-5 text-green-600" />
          <span>{t("services")}</span>
        </a>


        {/* Notices */}
        <a
          href="#notices"
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          <Megaphone className="h-5 w-5 text-orange-500" />
          <span>{t("notices")}</span>
        </a>


        {/* Contact */}
        <a
          href="#contact"
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-gray-700
            hover:text-blue-600
            transition
          "
        >
          <PhoneCall className="h-5 w-5 text-purple-600" />
          <span>{t("contact")}</span>
        </a>

      </div>


      {/* Right Side */}
      <div className="flex items-center gap-4 ml-6">

        {/* Language */}
        <LanguageSwitcher />


        {/* Login */}
        <Link href="/login">
          <Button className="flex items-center gap-2">
            <LogIn size={18} />
            {t("login")}
          </Button>
        </Link>

      </div>

    </nav>
  );
}