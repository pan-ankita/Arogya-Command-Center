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
    <nav className="sticky top-16 z-40 h-16 bg-background border-b shadow-sm backdrop-blur">
      {/* <div className="flex items-center gap-8 overflow-x-auto"> */}
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-center">
        <div className="flex items-center gap-10">
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
            <span>{t("HOME")}</span>
          </Link>

          {/* Health Centres */}
          <Link
            href="/citizen"
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
            <span>{t("HEALTH CENTRES")}</span>
          </Link>

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
            <span>{t("SERVICES")}</span>
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
            <span>{t("NOTICES")}</span>
          </a>

          {/* Contact */}
          <Link
            href="/citizen/complaint"
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
            <span>{t("CONTACT")}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
