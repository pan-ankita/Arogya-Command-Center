import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetStock, 
  useGetBeds, 
  useGetAttendance, 
  useGetTests,
  getGetStockQueryKey,
  getGetBedsQueryKey,
  getGetAttendanceQueryKey,
  getGetTestsQueryKey
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Bed, Stethoscope, TestTube, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function FacilityDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const facilityId = user?.facilityId as number;
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: stock, isLoading: loadingStock } = useGetStock(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetStockQueryKey({ facilityId }) } }
  );

  const { data: beds, isLoading: loadingBeds } = useGetBeds(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetBedsQueryKey({ facilityId }) } }
  );

  const { data: attendance, isLoading: loadingAttendance } = useGetAttendance(
    { facilityId, date: today },
    { query: { enabled: !!facilityId, queryKey: getGetAttendanceQueryKey({ facilityId, date: today }) } }
  );

  const { data: tests, isLoading: loadingTests } = useGetTests(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetTestsQueryKey({ facilityId }) } }
  );

  // Computed metrics
  const criticalStock = stock?.filter(s => s.stockStatus === 'critical' || s.stockStatus === 'out')?.length || 0;
  
  const totalBeds = beds?.reduce((sum, b) => sum + b.totalBeds, 0) || 0;
  const availableBeds = beds?.reduce((sum, b) => sum + (b.availableBeds || 0), 0) || 0;
  
  const presentDoctors = attendance?.filter(a => a.status === 'present')?.length || 0;
  
  const unavailableTests = tests?.filter(t => t.status !== 'available')?.length || 0;

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("dashboard")}
          </h2>
          <p className="text-muted-foreground">{t("overview_for")} {user?.facilityName}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loadingStock ? <SkeletonCard /> : (
            <Card className="border-l-4 border-l-amber-500 shadow-sm" data-testid="card-metric-stock">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"> {t("critical_stock")}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalStock} {t("items")}</div>
                <p className="text-xs text-muted-foreground">{t("running_out_soon")}</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs text-primary" data-testid="link-action-stock">
                  <Link href="/facility/stock">{t("update_stock")} →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {loadingBeds ? <SkeletonCard /> : (
            <Card className="border-l-4 border-l-blue-500 shadow-sm" data-testid="card-metric-beds">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("available_beds")}</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableBeds} <span className="text-lg font-normal text-muted-foreground">/ {totalBeds}</span></div>
                <p className="text-xs text-muted-foreground">{t("currently_available")}</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs text-primary" data-testid="link-action-beds">
                  <Link href="/facility/beds">{t("manage_beds")} →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {loadingAttendance ? <SkeletonCard /> : (
            <Card className="border-l-4 border-l-green-500 shadow-sm" data-testid="card-metric-attendance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("doctors_present")}</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{presentDoctors}</div>
                <p className="text-xs text-muted-foreground"> {t("checked_in_today")}</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs text-primary" data-testid="link-action-attendance">
                  <Link href="/facility/attendance"> {t("mark_attendance")} →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {loadingTests ? <SkeletonCard /> : (
            <Card className="border-l-4 border-l-purple-500 shadow-sm" data-testid="card-metric-tests">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">  {t("unavailable_tests")}
                </CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unavailableTests}</div>
                <p className="text-xs text-muted-foreground">{t("equipment_down")}</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-xs text-primary" data-testid="link-action-tests">
                  <Link href="/facility/tests">
                      {t("update_status")} →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("quick_actions")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline" data-testid="btn-quick-footfall">
                <Link href="/facility/footfall">{t("log_opd_footfall")}
                </Link>
              </Button>
              <Button asChild variant="outline" data-testid="btn-quick-stock">
                <Link href="/facility/stock"> {t("add_stock_received")}</Link>
              </Button>
              <Button asChild variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" data-testid="btn-quick-calamity">
                <Link href="/facility/calamity"><AlertTriangle className="mr-2 h-4 w-4" /> {t("declare_calamity")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </FacilityLayout>
  );
}
