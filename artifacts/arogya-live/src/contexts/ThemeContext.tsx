import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
// import { toast } from "@/components/ui/use-toast";
import { toast } from "@/hooks/use-toast";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
      return;
    }

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const systemTheme = systemDark ? "dark" : "light";

    setTheme(systemTheme);

    document.documentElement.classList.toggle("dark", systemDark);

    // alert("Theme automatically loaded from your system settings.");
    const alreadyShown = localStorage.getItem("themeNoticeShown");
    if (!alreadyShown) {
      toast({
        title: "Theme detected",
        description:
          "We've matched your device appearance. You can change it anytime.",
      });

      localStorage.setItem("themeNoticeShown", "true");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) throw new Error("ThemeProvider missing");

  return context;
}
