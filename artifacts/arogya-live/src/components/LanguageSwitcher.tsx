import { useTranslation } from "react-i18next";
import { useAppSettings } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppSettings();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-language-switcher">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-muted" : ""}
          data-testid="item-lang-en"
        >
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("hi")}
          className={language === "hi" ? "bg-muted" : ""}
          data-testid="item-lang-hi"
        >
          हिन्दी (HI)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("bn")}
          className={language === "bn" ? "bg-muted" : ""}
          data-testid="item-lang-bn"
        >
          বাংলা (BN)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
