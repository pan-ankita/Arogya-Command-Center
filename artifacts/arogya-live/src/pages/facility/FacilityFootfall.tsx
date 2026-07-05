import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetFootfall, 
  useLogFootfall,
  getGetFootfallQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Users, Plus, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";

const DEPARTMENTS = ["OPD", "Emergency", "ANC", "Pediatric", "General"];

export default function FacilityFootfall() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [counts, setCounts] = useState<Record<string, number>>({});

  const { data: footfall, isLoading } = useGetFootfall(
    { facilityId, days: 7 },
    { query: { enabled: !!facilityId, queryKey: getGetFootfallQueryKey({ facilityId, days: 7 }) } }
  );

  const logFootfall = useLogFootfall();

  // Process data for today's current counts
  const todayFootfall = footfall?.filter(f => f.logDate.startsWith(today)) || [];
  
  const getTodayCount = (dept: string) => {
    return todayFootfall.find(f => f.department === dept)?.count || 0;
  };

  // Process data for the chart (aggregate by date)
  const chartData = [];
  if (footfall) {
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayRecords = footfall.filter(f => f.logDate.startsWith(date));
      const total = dayRecords.reduce((sum, r) => sum + r.count, 0);
      chartData.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        fullDate: date,
        total
      });
    }
  }

  const handleUpdateCount = (dept: string, newCount: number) => {
    if (newCount < 0) return;
    
    // Optimistic update locally
    setCounts(prev => ({ ...prev, [dept]: newCount }));
    
    logFootfall.mutate(
      {
        data: {
          facilityId,
          department: dept,
          count: newCount
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFootfallQueryKey({ facilityId }) });
        },
        onError: () => {
          toast({
            title: "Update Failed",
            description: "Could not sync count with server.",
            variant: "destructive"
          });
          // Revert on error
          setCounts(prev => ({ ...prev, [dept]: getTodayCount(dept) }));
        }
      }
    );
  };

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Footfall Counters</h2>
          <p className="text-muted-foreground">Track patient visits across departments for today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => {
            const serverCount = getTodayCount(dept);
            const displayCount = counts[dept] !== undefined ? counts[dept] : serverCount;
            
            return (
              <Card key={dept} className="shadow-sm" data-testid={`card-footfall-${dept}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {dept}
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold font-mono">{displayCount}</div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-full"
                        onClick={() => handleUpdateCount(dept, displayCount - 1)}
                        disabled={displayCount <= 0 || logFootfall.isPending}
                        data-testid={`btn-dec-${dept}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="icon" 
                        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                        onClick={() => handleUpdateCount(dept, displayCount + 1)}
                        disabled={logFootfall.isPending}
                        data-testid={`btn-inc-${dept}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>7-Day Trend</CardTitle>
            <CardDescription>Total daily patients across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#0F766E" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, fill: '#0F766E', strokeWidth: 0 }}
                      name="Total Patients"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FacilityLayout>
  );
}
