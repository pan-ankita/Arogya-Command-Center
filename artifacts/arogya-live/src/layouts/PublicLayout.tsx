import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
// import PublicNavbar from "@/components/PublicNavbar";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between"> */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
            data-testid="link-home"
          >
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block">
              {t("app_name")}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      {/* <PublicNavbar /> */}
      <main className="flex-1 w-full">{children}</main>
      <footer className="border-t bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-white text-lg">
              {t("footer_title")}
            </h3>

            <p className="text-sm"> {t("footer_description")}</p>
          </div>

          <div className="flex gap-6 text-sm">
            <a href="#">{t("privacy_policy")}</a>

            <a href="#">{t("contact")}</a>

            <a href="#">{t("help")}</a>
          </div>

          <div className="text-sm">{t("copyright")}</div>
        </div>
      </footer>
    </div>
  );
}
