import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (highContrast: boolean) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  fontSize: 16,
  setFontSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  
  const [language, setLanguageState] = useState(localStorage.getItem("language") || "en");
  const [fontSize, setFontSizeState] = useState(Number(localStorage.getItem("fontSize")) || 16);
  const [highContrast, setHighContrastState] = useState(localStorage.getItem("highContrast") === "true");

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("fontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
    localStorage.setItem("highContrast", highContrast.toString());
  }, [highContrast]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, fontSize, setFontSize: setFontSizeState, highContrast, setHighContrast: setHighContrastState }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useAppSettings = () => useContext(LanguageContext);
