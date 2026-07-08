import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="flex flex-col">

        {/* ================= HERO ================= */}
        <section className="flex min-h-[80vh] flex-col items-center justify-center text-center px-6 bg-slate-50">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl">
              <Activity className="h-10 w-10 text-primary" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold">
              {t("tagline")}
            </h1>

            <p className="text-xl text-slate-600">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/login?role=staff">
                  {t("login_staff")}
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Link href="/login?role=admin">
                  {t("login_admin")}
                </Link>
              </Button>
            </div>

            <Button asChild variant="link">
              <Link href="/citizen">
                {t("find_facility")} →
              </Link>
            </Button>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              About Arogya Command Center
            </h2>

            <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-8">
              Arogya Command Center is an AI-powered healthcare monitoring
              platform that helps monitor medicine stock, bed availability,
              doctor attendance, laboratory services and emergency situations
              across healthcare facilities in real time.
            </p>
          </div>
        </section>

        {/* ================= NOTICES ================= */}
        <section id="notices" className="bg-amber-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">
              {t("notices")}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg">
                  {t("vaccination_camp")}
                </h3>
                <p className="mt-3 text-slate-600">
                  {t("vaccination_desc")}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg">
                  {t("blood_donation")}
                </h3>
                <p className="mt-3 text-slate-600">
                  {t("blood_donation_desc")}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg">
                  {t("telemedicine")}
                </h3>
                <p className="mt-3 text-slate-600">
                  {t("telemedicine_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section id="services" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">
              Services
            </h2>

            <div className="grid md:grid-cols-3 gap-10">

              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-5">
                  <Zap className="text-blue-600" />
                </div>

                <h3 className="text-xl font-semibold">
                  {t("real_time_insights")}
                </h3>

                <p className="text-slate-600 mt-3">
                  {t("real_time_insights_desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
                  <ShieldCheck className="text-green-600" />
                </div>

                <h3 className="text-xl font-semibold">
                  {t("ai_redistribution")}
                </h3>

                <p className="text-slate-600 mt-3">
                  {t("ai_redistribution_desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-5">
                  <Users className="text-orange-600" />
                </div>

                <h3 className="text-xl font-semibold">
                  {t("citizen_transparency")}
                </h3>

                <p className="text-slate-600 mt-3">
                  {t("citizen_transparency_desc")}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section
          id="contact"
          className="py-20 bg-slate-900 text-white"
        >
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Contact Us
            </h2>

            <p className="text-slate-300 mb-3">
              Email: support@arogyalive.gov.in
            </p>

            <p className="text-slate-300 mb-3">
              Phone: +91 9876543210
            </p>

            <p className="text-slate-300">
              Department of Health & Family Welfare,
              Government of West Bengal
            </p>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}