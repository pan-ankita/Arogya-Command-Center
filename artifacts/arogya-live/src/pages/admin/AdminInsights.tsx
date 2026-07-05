import { AdminLayout } from "@/layouts/AdminLayout";
import { 
  useGetForecast,
  useGetPerformanceFlags,
  getGetForecastQueryKey,
  getGetPerformanceFlagsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminInsights() {
  // Hardcoding facility 1 for demo purposes on this page
  const facilityId = 1; 

  const { data: forecast, isLoading: loadingForecast } = useGetForecast(
    facilityId,
    { query: { enabled: true, queryKey: getGetForecastQueryKey(facilityId) } }
  );

  const { data: flags, isLoading: loadingFlags } = useGetPerformanceFlags({
    query: { queryKey: getGetPerformanceFlagsQueryKey() }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            AI Insights & Forecasting
          </h2>
          <p className="text-muted-foreground">Predictive analytics for resource planning.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  7-Day Stock Depletion Forecast
                </CardTitle>
                <CardDescription>Predicted consumption based on historical footfall and seasonality</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingForecast ? (
                  <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl" />
                ) : forecast?.medicines && forecast.medicines.length > 0 ? (
                  <div className="space-y-8">
                    {forecast.medicines.map((med) => (
                      <div key={med.medicineId} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="font-semibold">{med.medicineName}</h4>
                            <p className="text-xs text-slate-500">Current: {med.currentStock} units • Est. {med.daysRemaining} days left</p>
                          </div>
                          {med.aiInsight && (
                            <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-sm">
                              <Lightbulb className="h-3 w-3" />
                              <span className="truncate">{med.aiInsight}</span>
                            </div>
                          )}
                        </div>
                        <div className="h-[150px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={med.forecastData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                              <defs>
                                <linearGradient id={`color-${med.medicineId}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={med.riskLevel === 'critical' ? '#DC2626' : '#0F766E'} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={med.riskLevel === 'critical' ? '#DC2626' : '#0F766E'} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} width={40} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="projected" 
                                stroke={med.riskLevel === 'critical' ? '#DC2626' : '#0F766E'} 
                                fillOpacity={1} 
                                fill={`url(#color-${med.medicineId})`} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">No forecast data available.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-amber-200">
              <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Performance Flags
                </CardTitle>
                <CardDescription>Facilities requiring admin attention</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                {loadingFlags ? (
                  <div className="p-4 space-y-4"><SkeletonCard /></div>
                ) : flags && flags.length > 0 ? (
                  <div className="divide-y">
                    {flags.map(flag => (
                      <div key={flag.id} className="p-4 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{flag.facilityName}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                            flag.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            Score: {flag.compositeScore}
                          </span>
                        </div>
                        {flag.reasonBreakdown && (
                          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4 mt-2">
                            {Object.entries(flag.reasonBreakdown).map(([key, value]) => (
                              <li key={key}>{String(value)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">No flags raised.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
