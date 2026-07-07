import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Activity, 
  LayoutDashboard, 
  Package, 
  Users, 
  Bed, 
  Stethoscope, 
  TestTube, 
  AlertOctagon,
  LogOut,
  Settings,
  Menu
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
import { VoiceMic } from "@/components/VoiceMic";

const NAV_ITEMS = [
  { href: "/facility/dashboard", icon: LayoutDashboard, label: "dashboard" },
  { href: "/facility/stock", icon: Package, label: "stock" },
  { href: "/facility/footfall", icon: Users, label: "footfall" },
  { href: "/facility/beds", icon: Bed, label: "beds" },
  { href: "/facility/attendance", icon: Stethoscope, label: "attendance" },
  { href: "/facility/tests", icon: TestTube, label: "tests" },
  { href: "/facility/calamity", icon: AlertOctagon, label: "calamity" },
];

export function FacilityLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [location] = useLocation();

  if (!user || user.role !== "facility_staff") {
    // Should ideally redirect but handled at App level
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
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold" data-testid="link-home">
              <div className="bg-primary p-1 rounded-md text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-heading tracking-tight text-lg">{t("app_name")}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
              <NavLinks />
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold truncate px-2">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate px-2">{user.facilityName}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full h-full max-h-screen overflow-hidden bg-background">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                data-testid="btn-mobile-menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggle_navigation")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-72">
              <div className="flex h-14 items-center border-b pb-4 mb-4">
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
            <h1 className="text-lg font-semibold md:hidden truncate">{user.facilityName}</h1>
          </div>
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="btn-user-menu">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="sr-only">{t("toggle_user_menu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
          {children}
        </main>
      </div>
      
      {/* Voice Mic Component - always visible on facility pages */}
      <VoiceMic facilityId={user.facilityId!} />
    </div>
  );
}
