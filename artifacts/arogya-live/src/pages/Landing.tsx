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
        {/* <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-slate-50 bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,white_05%,transparent_100%)] relative"> */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-slate-50 bg-grid-slate-200/50 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full w-full bg-slate-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-2xl mb-4">
              <Activity className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 tracking-tight leading-tight">
              Real-time visibility.
              <br />
              <span className="text-primary">Smarter resources.</span>
              <br />
              Healthier districts.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The digital command center for Primary and Community Health
              Centers. Replacing paper registers with fast, voice-enabled,
              real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {/* <Button asChild size="lg" className="h-14 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto" data-testid="btn-login-staff"> */}
                <Button asChild size="lg" className="h-14 px-8 rounded-xl bg-blue-400 hover:bg-blue-700 text-white text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" data-testid="btn-login-staff">
                <Link href="/login?role=staff">Facility Staff Login</Link>
              </Button>
              {/* <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto"
                data-testid="btn-login-admin"> */}
                <Button asChild size="lg" variant="secondary" className="h-14 px-8 rounded-xl bg-emerald-400 hover:bg-emerald-700 text-white text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" data-testid="btn-login-admin">
                <Link href="/login?role=admin">District Admin Login</Link>
              </Button>
            </div>

            <div className="pt-4">
              {/* <Button asChild variant="link" className="text-slate-500 hover:text-slate-900" data-testid="btn-find-facility"> */}
              <Button
                asChild
                variant="link"
                className="text-blue-600 text-lg font-semibold hover:text-blue-800 hover:underline underline-offset-4"
                data-testid="btn-find-facility"
              >
                <Link href="/citizen">Find a Health Centre near you →</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-amber-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Notices & Announcements</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg">Vaccination Camp</h3>

                <p className="text-slate-600 mt-2">
                  Free vaccination drive across all PHCs from July 15–20.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg">Blood Donation Camp</h3>

                <p className="text-slate-600 mt-2">
                  Community Blood Donation Camp this weekend.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg">
                  New Telemedicine Service
                </h3>

                <p className="text-slate-600 mt-2">
                  Online consultations are now available in selected health
                  centres.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Insights</h3>
                <p className="text-slate-600 leading-relaxed">
                  Spot stockouts, bed shortages, and staff absences instantly.
                  No more waiting for end-of-month reports.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">AI Redistribution</h3>
                <p className="text-slate-600 leading-relaxed">
                  Smart algorithms suggest resource redistribution between
                  facilities to prevent localized shortages.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Citizen Transparency</h3>
                <p className="text-slate-600 leading-relaxed">
                  Public portal allowing citizens to check bed availability and
                  doctor presence before visiting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
