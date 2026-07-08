import { useGetAlerts, useMarkAlertRead, getGetAlertsQueryKey, AlertSeverity } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, AlertTriangle, Info, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";

export function AlertsSidebar({ onClose }: { onClose: () => void }) {
  const { data: alerts, isLoading } = useGetAlerts({ severity: "" }); // Get all alerts for now
  const markRead = useMarkAlertRead();
  const queryClient = useQueryClient();

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-50 border-red-100";
      case "warning": return "bg-amber-50 border-amber-100";
      default: return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="flex flex-col h-full h-[calc(100vh-60px)]">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Live Alerts
          {alerts && alerts.filter(a => !a.isRead).length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs py-0.5 px-2 rounded-full font-bold">
              {alerts.filter(a => !a.isRead).length} new
            </span>
          )}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-muted">
                <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p>No active alerts</p>
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-xl border flex gap-3 group relative ${
                  !alert.isRead ? getSeverityColor(alert.severity) : "bg-card border-slate-100 opacity-70"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {alert.facilityName || 'System'}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium leading-snug">
                    {alert.message}
                  </p>
                  
                  {!alert.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs mt-2 -ml-2 text-slate-500 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleMarkRead(alert.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
                {!alert.isRead && (
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
