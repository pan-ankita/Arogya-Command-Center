import { useRoute } from "wouter";
import { PublicLayout } from "@/layouts/PublicLayout";
import { 
  useGetFacility, 
  useGetStock,
  useGetBeds,
  useGetAttendance,
  getGetFacilityQueryKey,
  getGetStockQueryKey,
  getGetBedsQueryKey,
  getGetAttendanceQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/SkeletonCard";
import { MapPin, Phone, UserCircle, Bed, Package, Stethoscope, AlertTriangle, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function CitizenFacilityView() {
  const [, params] = useRoute("/citizen/facility/:id");
  const facilityId = parseInt(params?.id || "0");
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: facility, isLoading: loadingFacility } = useGetFacility(
    facilityId,
    { query: { enabled: !!facilityId, queryKey: getGetFacilityQueryKey(facilityId) } }
  );

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

  if (loadingFacility) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PublicLayout>
    );
  }

  if (!facility) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center text-slate-500">
          Facility not found.
        </div>
      </PublicLayout>
    );
  }

  // Derived public metrics
  const totalBeds = beds?.reduce((sum, b) => sum + b.totalBeds, 0) || 0;
  const availableBeds = beds?.reduce((sum, b) => sum + (b.availableBeds || 0), 0) || 0;
  const presentDoctors = attendance?.filter(a => a.status === 'present')?.length || 0;
  
  // Only show essential medicines publicly
  const essentialMeds = stock?.filter(s => 
    s.medicineName.toLowerCase().includes('paracetamol') || 
    s.medicineName.toLowerCase().includes('insulin') ||
    s.medicineName.toLowerCase().includes('ors') ||
    s.medicineName.toLowerCase().includes('amoxicillin')
  ) || [];

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-slate-50 py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white mb-6 -ml-3">
            <Link href="/citizen"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Search</Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded-sm">
                  {facility.type}
                </span>
                {facility.hasActiveCalamity && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-sm font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Emergency Active
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
                {facility.name}
              </h1>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-slate-500" />
                  <span className="text-lg">{facility.address}</span>
                </div>
                {facility.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 shrink-0 text-slate-500" />
                    <span className="text-lg">{facility.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-2xl md:min-w-[300px]">
              <div className="text-sm text-slate-400 mb-1">Current Status</div>
              <div className="mb-4">
                <StatusBadge 
                  status={facility.healthStatus === 'critical' ? 'critical' : 'success'} 
                  text={facility.healthStatus === 'critical' ? 'Experiencing High Load' : 'Normal Operations'} 
                />
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Available Beds</span>
                  <span className="font-mono font-bold text-xl text-white">{availableBeds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Doctors Present</span>
                  <span className="font-mono font-bold text-xl text-white">{presentDoctors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bed className="h-6 w-6 text-primary" /> Bed Availability
              </h2>
              {loadingBeds ? (
                <SkeletonCard />
              ) : beds?.length === 0 ? (
                <div className="text-slate-500 border rounded-xl p-6 bg-slate-50">No bed data available.</div>
              ) : (
                <div className="grid gap-4">
                  {beds?.map(ward => (
                    <Card key={ward.id} className="shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="font-semibold text-lg">{ward.wardName}</div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold font-mono ${(ward.availableBeds || 0) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {ward.availableBeds} <span className="text-sm font-normal text-slate-500 font-sans">available</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-primary" /> Doctors Available Today
              </h2>
              {loadingAttendance ? (
                <SkeletonCard />
              ) : attendance?.filter(a => a.status === 'present').length === 0 ? (
                <div className="text-slate-500 border rounded-xl p-6 bg-slate-50">No doctors currently checked in.</div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <div className="divide-y">
                    {attendance?.filter(a => a.status === 'present').map(record => (
                      <div key={record.id} className="p-4 flex items-center gap-4">
                        <div className="bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{record.doctorName}</div>
                          <div className="text-xs text-green-600 font-medium">Checked in at {record.checkInTime ? format(new Date(record.checkInTime), 'h:mm a') : 'today'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div>
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" /> Essential Medicines Status
              </h2>
              {loadingStock ? (
                <SkeletonCard />
              ) : essentialMeds.length === 0 ? (
                <div className="text-slate-500 border rounded-xl p-6 bg-slate-50">Medicine stock data not currently public.</div>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {essentialMeds.map(med => (
                        <div key={med.id} className="p-4 flex justify-between items-center">
                          <div className="font-medium text-slate-900">{med.medicineName}</div>
                          <StatusBadge 
                            status={med.stockStatus === 'out' ? 'critical' : med.stockStatus === 'low' ? 'warning' : 'success'} 
                            text={med.stockStatus === 'out' ? 'Out of Stock' : med.stockStatus === 'low' ? 'Low Stock' : 'Available'} 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
