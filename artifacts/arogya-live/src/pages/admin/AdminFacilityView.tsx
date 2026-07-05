import { useRoute } from "wouter";
import { AdminLayout } from "@/layouts/AdminLayout";
import { 
  useGetFacility, 
  useGetFacilityHealthScore,
  useGetStock,
  useGetBeds,
  getGetFacilityQueryKey,
  getGetFacilityHealthScoreQueryKey,
  getGetStockQueryKey,
  getGetBedsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Activity, Package, Bed, Stethoscope, TestTube, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminFacilityView() {
  const [, params] = useRoute("/admin/facility/:id");
  const facilityId = parseInt(params?.id || "0");

  const { data: facility, isLoading: loadingFacility } = useGetFacility(
    facilityId,
    { query: { enabled: !!facilityId, queryKey: getGetFacilityQueryKey(facilityId) } }
  );

  const { data: health, isLoading: loadingHealth } = useGetFacilityHealthScore(
    facilityId,
    { query: { enabled: !!facilityId, queryKey: getGetFacilityHealthScoreQueryKey(facilityId) } }
  );

  const { data: stock, isLoading: loadingStock } = useGetStock(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetStockQueryKey({ facilityId }) } }
  );

  const { data: beds, isLoading: loadingBeds } = useGetBeds(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetBedsQueryKey({ facilityId }) } }
  );

  const criticalStock = stock?.filter(s => s.stockStatus === 'critical' || s.stockStatus === 'out') || [];
  const totalBeds = beds?.reduce((sum, b) => sum + b.totalBeds, 0) || 0;
  const occupiedBeds = beds?.reduce((sum, b) => sum + b.occupiedBeds, 0) || 0;
  const bedOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  if (loadingFacility) {
    return (
      <AdminLayout>
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      </AdminLayout>
    );
  }

  if (!facility) {
    return (
      <AdminLayout>
        <div className="text-center py-20">Facility not found</div>
      </AdminLayout>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-600";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <Link href="/admin/dashboard"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{facility.name}</h2>
              <StatusBadge 
                status={facility.healthStatus === 'healthy' ? 'success' : facility.healthStatus === 'watch' ? 'warning' : 'critical'} 
                text={facility.healthStatus ? facility.healthStatus.toUpperCase() : 'UNKNOWN'} 
              />
            </div>
            <p className="text-muted-foreground">{facility.type} • {facility.address}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <Card className="shadow-sm md:col-span-1 border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHealth ? <div className="h-32 animate-pulse bg-slate-100 rounded-lg" /> : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className={`text-6xl font-bold tracking-tighter ${getScoreColor(health?.score || 0)}`}>
                    {health?.score || 0}
                  </div>
                  <div className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wider">out of 100</div>
                  
                  <div className="w-full mt-8 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-2"><Package className="h-4 w-4"/> Stock Reliability</span>
                      <span className="font-semibold">{health?.breakdown?.stockReliability || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-2"><Bed className="h-4 w-4"/> Bed Availability</span>
                      <span className="font-semibold">{100 - (health?.breakdown?.bedStress || 0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Doctor Presence</span>
                      <span className="font-semibold">{health?.breakdown?.doctorAttendance || 0}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {/* Critical Issues Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className={`shadow-sm ${criticalStock.length > 0 ? 'border-red-200 bg-red-50/20' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${criticalStock.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Stock Status</h3>
                      {criticalStock.length > 0 ? (
                        <div>
                          <p className="text-red-600 font-medium mb-2">{criticalStock.length} items critical</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {criticalStock.slice(0, 3).map(s => (
                              <li key={s.id}>• {s.medicineName} ({s.currentQuantity} {s.unit})</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="h-4 w-4"/> Adequate</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`shadow-sm ${bedOccupancy >= 90 ? 'border-red-200 bg-red-50/20' : bedOccupancy >= 75 ? 'border-amber-200 bg-amber-50/20' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${bedOccupancy >= 90 ? 'bg-red-100 text-red-600' : bedOccupancy >= 75 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Bed className="h-6 w-6" />
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-1">Bed Occupancy</h3>
                      <div className="flex items-end justify-between mb-2">
                        <span className={`text-2xl font-bold ${bedOccupancy >= 90 ? 'text-red-600' : bedOccupancy >= 75 ? 'text-amber-600' : 'text-slate-900'}`}>{bedOccupancy}%</span>
                        <span className="text-sm text-slate-500">{occupiedBeds} / {totalBeds} occupied</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${bedOccupancy >= 90 ? 'bg-red-600' : bedOccupancy >= 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${bedOccupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder for charts or more detailed tables */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from facility staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  Detailed activity log would appear here in production.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
