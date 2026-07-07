import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/layouts/AdminLayout";
import { 
  useGetDistrictSummary, 
  useGetFacilities,
  useGetAlerts,
  getGetDistrictSummaryQueryKey,
  getGetFacilitiesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, AlertOctagon, RefreshCw, Building2, AlertTriangle, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDistrictSummary({
    query: { queryKey: getGetDistrictSummaryQueryKey() }
  });

  const { data: facilities, isLoading: loadingFacilities } = useGetFacilities({
    query: { queryKey: getGetFacilitiesQueryKey() }
  });

  const { data: alerts } = useGetAlerts({ severity: "critical" });
  const criticalAlerts = alerts?.filter(a => !a.isRead) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">District Command Center</h2>
            <p className="text-slate-500">Hooghly District Overview</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href="/admin/redistribution"><RefreshCw className="mr-2 h-4 w-4" /> Resource AI</Link>
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingSummary ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Total Facilities</p>
                      <p className="text-3xl font-bold">{summary?.totalFacilities || 0}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/30">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Critical Status</p>
                      <p className="text-3xl font-bold text-red-700">{summary?.redCount || 0}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Active Calamities</p>
                      <p className="text-3xl font-bold">{summary?.activeCalamities || 0}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <AlertOctagon className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Redistribution Recs</p>
                      <p className="text-3xl font-bold">{summary?.pendingRedistributions || 0}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Facility Map / Grid View */}
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">District Facilities Map</CardTitle>
                    <CardDescription>Live health status across the district</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingFacilities ? (
                  <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {facilities?.map(facility => (
                      <Link key={facility.id} href={`/admin/facility/${facility.id}`}>
                        <div className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer h-full ${
                          facility.healthStatus === 'critical' ? 'border-red-300 bg-red-50/50 hover:bg-red-50' :
                          facility.healthStatus === 'watch' ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/50' :
                          'border-border hover:border-border bg-card'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground">{facility.name}</h3>
                                {facility.hasActiveCalamity && (
                                  <AlertOctagon className="h-4 w-4 text-red-600 fill-red-100" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{facility.type}</p>
                            </div>
                            <StatusBadge 
                              status={facility.healthStatus === 'healthy' ? 'success' : facility.healthStatus === 'watch' ? 'warning' : 'critical'} 
                              text={facility.healthStatus ? facility.healthStatus.toUpperCase() : 'UNKNOWN'} 
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-slate-100/50">
                            <span className="text-slate-500">View live metrics</span>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-red-200 overflow-hidden">
              <div className="bg-red-600 text-white px-4 py-3 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Critical Alerts
                </div>
                {criticalAlerts.length > 0 && (
                  <span className="bg-card text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {criticalAlerts.length}
                  </span>
                )}
              </div>
              <CardContent className="p-0">
                {criticalAlerts.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                    <p>No critical alerts currently.</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {criticalAlerts.slice(0, 5).map(alert => (
                      <div key={alert.id} className="p-4 bg-red-50/30">
                        <div className="text-xs font-semibold text-red-800 mb-1">{alert.facilityName}</div>
                        <p className="text-sm text-foreground">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {criticalAlerts.length > 5 && (
                  <div className="p-3 border-t bg-background text-center">
                    <Button asChild variant="link" className="text-xs h-auto p-0 text-muted-foreground">
                      <Link href="/admin/alerts">View all alerts →</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
