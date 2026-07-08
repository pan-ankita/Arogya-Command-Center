import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Activity, ShieldCheck, Zap, Users } from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        {/* <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-background bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,white_05%,transparent_100%)] relative"> */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-background bg-grid-slate-200/50 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-2xl mb-4">
              <Activity className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground tracking-tight leading-tight">
              {t("tagline")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {/* <Button asChild size="lg" className="h-14 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto" data-testid="btn-login-staff"> */}
              <Button
                asChild
                size="lg"
                className="h-14 px-8 rounded-xl bg-blue-400 hover:bg-blue-700 text-white text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                data-testid="btn-login-staff"
              >
                <Link href="/login?role=staff">{t("login_staff")}</Link>
              </Button>
              {/* <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto"
                data-testid="btn-login-admin"> */}
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 px-8 rounded-xl bg-emerald-400 hover:bg-emerald-700 text-white text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                data-testid="btn-login-admin"
              >
                <Link href="/login?role=admin"> {t("login_admin")}</Link>
              </Button>
            </div>

            <div className="pt-4">
              {/* <Button asChild variant="link" className="text-slate-500 hover:text-foreground" data-testid="btn-find-facility"> */}
              <Button
                asChild
                variant="link"
                className="text-blue-600 text-lg font-semibold hover:text-blue-800 hover:underline underline-offset-4"
                data-testid="btn-find-facility"
              >
                <Link href="/citizen">{t("find_facility")} →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* <section className="bg-amber-50 py-16"> */}
        {/* <section className="bg-background py-16"> */}
        <section className="bg-muted py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl text-foreground font-bold mb-8">
              {t("notices")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg">
                  {t("vaccination_camp")}
                </h3>

                <p className="text-muted-foreground mt-2">
                  {t("vaccination_desc")}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg">{t("blood_donation")}</h3>

                <p className="text-muted-foreground mt-2">
                  {t("blood_donation_desc")}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg">{t("telemedicine")}</h3>

                <p className="text-muted-foreground mt-2">
                  {t("telemedicine_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card">
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("real_time_insights")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("real_time_insights_desc")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("ai_redistribution")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("ai_redistribution_desc")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("citizen_transparency")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("citizen_transparency_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
