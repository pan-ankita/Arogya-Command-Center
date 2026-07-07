import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Activity, 
  LayoutDashboard, 
  Map, 
  AlertTriangle,
  MessageSquare,
  ArrowRightLeft,
  Lightbulb,
  LogOut,
  Settings,
  Menu,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlertsSidebar } from "@/components/AlertsSidebar";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "dashboard" },
  { href: "/admin/alerts", icon: AlertTriangle, label: "alerts" },
  { href: "/admin/redistribution", icon: ArrowRightLeft, label: "redistribution" },
  { href: "/admin/insights", icon: Lightbulb, label: "insights" },
  { href: "/admin/assistant", icon: MessageSquare, label: "assistant" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [location] = useLocation();
  const [alertsOpen, setAlertsOpen] = useState(false);

  if (!user || user.role !== "district_admin") {
    return null;
  }

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            data-testid={`nav-${item.label}`}
          >
            <Icon className="h-4 w-4" />
            {t(item.label)}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-slate-900 text-slate-50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold" data-testid="link-home">
              <div className="bg-primary p-1 rounded-md text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-heading tracking-tight text-lg">{t("app_name")} <span className="text-xs font-normal text-slate-400">Admin</span></span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
              <NavLinks />
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold truncate px-2">{user.name}</div>
              <div className="text-xs text-slate-400 truncate px-2">District Admin</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full h-full max-h-screen overflow-hidden bg-background/50">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                data-testid="btn-mobile-menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-72 bg-slate-900 text-slate-50 border-r-slate-800">
              <div className="flex h-14 items-center border-b border-slate-800 pb-4 mb-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <div className="bg-primary p-1 rounded-md text-primary-foreground">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="font-heading tracking-tight text-lg">{t("app_name")}</span>
                </Link>
              </div>
              <nav className="grid gap-2 text-lg font-medium">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:hidden truncate">Admin</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setAlertsOpen(true)}
            className="relative"
            data-testid="btn-alerts-toggle"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-white" />
          </Button>
          
          <LanguageSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="btn-user-menu">
                <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <div className="flex-1 overflow-hidden relative flex">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full">
            {children}
          </main>
          
          {/* Slide-over alerts panel */}
          <div 
            className={`w-80 border-l bg-card flex flex-col transition-all duration-300 transform ${
              alertsOpen ? "translate-x-0" : "translate-x-full hidden"
            }`}
          >
            <AlertsSidebar onClose={() => setAlertsOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
