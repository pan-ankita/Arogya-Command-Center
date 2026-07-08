import { useTranslation } from "react-i18next";
import PublicNavbar from "@/components/PublicNavbar";

export function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">

      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">

        <PublicNavbar />

      </header>


      {/* Page Content */}
      <main className="flex-1 w-full pt-20">

        {children}

      </main>


      {/* Footer */}
      <footer className="border-t bg-slate-900 text-slate-300 py-8">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <h3 className="font-bold text-white text-lg">
              {t("footer_title")}
            </h3>

            <p className="text-sm">
              {t("footer_description")}
            </p>
          </div>


          <div className="flex gap-6 text-sm">

            <a href="#">
              {t("privacy_policy")}
            </a>

            <a href="#contact">
              {t("contact")}
            </a>

            <a href="#">
              {t("help")}
            </a>

          </div>


          <div className="text-sm">
            {t("copyright")}
          </div>

        </div>

      </footer>

    </div>
  );
}