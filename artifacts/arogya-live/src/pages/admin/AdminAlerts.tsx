import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { 
  useGetAlerts,
  useMarkAlertRead,
  getGetAlertsQueryKey,
  AlertSeverity
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { AlertTriangle, AlertCircle, Info, Filter, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminAlerts() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useGetAlerts(
    { severity: severityFilter === "all" ? undefined : severityFilter },
    { query: { queryKey: getGetAlertsQueryKey({ severity: severityFilter === "all" ? undefined : severityFilter }) } }
  );

  const markRead = useMarkAlertRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
      }
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Alerts</h2>
            <p className="text-muted-foreground">Log of all district-wide notifications and automated flags.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-card border rounded-lg p-1 shadow-sm">
            <Filter className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="border-0 focus:ring-0 w-[150px] shadow-none">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-sm border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><SkeletonList /></div>
            ) : !alerts || alerts.length === 0 ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No alerts found</p>
                <p className="text-sm">Try changing your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 transition-colors hover:bg-background/50 ${!alert.isRead ? 'bg-background/80' : ''}`}>
                    <div className="flex-1 flex gap-4">
                      <div className="shrink-0 mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground">{alert.facilityName || 'System'}</span>
                          <span className="text-xs text-slate-400">• {alert.type}</span>
                        </div>
                        <p className={`text-foreground ${!alert.isRead ? 'font-medium' : ''}`}>
                          {alert.message}
                        </p>
                        <div className="text-xs text-slate-500 mt-2">
                          {format(new Date(alert.createdAt), 'MMM d, yyyy - h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    {!alert.isRead && (
                      <div className="shrink-0 flex items-center justify-end sm:justify-start">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMarkRead(alert.id)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Mark Read
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
