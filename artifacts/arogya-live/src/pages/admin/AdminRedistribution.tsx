import { AdminLayout } from "@/layouts/AdminLayout";
import { 
  useGetRedistributionRecommendations,
  useGenerateRedistribution,
  useAcceptRedistribution,
  useRejectRedistribution,
  getGetRedistributionRecommendationsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { ArrowRightLeft, ArrowRight, Check, X, RefreshCw, AlertTriangle, Truck, Lightbulb } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function AdminRedistribution() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useGetRedistributionRecommendations({
    query: { queryKey: getGetRedistributionRecommendationsQueryKey() }
  });

  const generateRecs = useGenerateRedistribution();
  const acceptRec = useAcceptRedistribution();
  const rejectRec = useRejectRedistribution();

  const pendingRecs = recommendations?.filter(r => r.status === 'pending') || [];
  const handledRecs = recommendations?.filter(r => r.status !== 'pending') || [];

  const handleGenerate = () => {
    generateRecs.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRedistributionRecommendationsQueryKey() });
        toast({
          title: "Analysis Complete",
          description: "New redistribution recommendations generated.",
        });
      }
    });
  };

  const handleAccept = (id: number) => {
    acceptRec.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRedistributionRecommendationsQueryKey() });
          toast({
            title: "Accepted",
            description: "Transfer order created successfully.",
            className: "bg-green-50 text-green-900 border-green-200",
          });
        }
      }
    );
  };

  const handleReject = (id: number) => {
    rejectRec.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRedistributionRecommendationsQueryKey() });
          toast({
            title: "Rejected",
            description: "Recommendation dismissed.",
          });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              Resource Redistribution
            </h2>
            <p className="text-muted-foreground">AI-driven transfers to prevent localized stockouts.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={generateRecs.isPending}
            className="bg-primary hover:bg-primary/90 shadow-md"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generateRecs.isPending ? 'animate-spin' : ''}`} /> 
            Run Network Analysis
          </Button>
        </div>

        {isLoading ? (
          <SkeletonList />
        ) : pendingRecs.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Network Balanced</h3>
              <p>No redistributions currently recommended.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pendingRecs.map(rec => (
              <Card key={rec.id} className="shadow-md border-slate-200 overflow-hidden relative">
                {rec.priority === 'critical' && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                )}
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {rec.medicineName || 'Resource'} Transfer
                        {rec.priority === 'critical' && (
                          <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">Critical</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Move <strong className="text-slate-900">{rec.suggestedQuantity} units</strong> to prevent stockout
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 pb-2">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1 text-center bg-slate-100 rounded-lg p-3 relative">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Source (Surplus)</div>
                      <div className="font-bold text-primary truncate" title={rec.sourceFacilityName}>{rec.sourceFacilityName}</div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="bg-slate-900 text-white p-2 rounded-full shadow-md z-10 relative">
                        <Truck className="h-4 w-4" />
                      </div>
                      {rec.distanceKm && (
                        <div className="text-[10px] font-medium text-slate-500 mt-1">{rec.distanceKm} km</div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center bg-red-50 rounded-lg p-3 relative">
                      <div className="text-xs text-red-500 font-semibold uppercase tracking-wider mb-1">Target (Deficit)</div>
                      <div className="font-bold text-red-700 truncate" title={rec.targetFacilityName}>{rec.targetFacilityName}</div>
                    </div>
                  </div>
                  
                  {rec.reasoningText && (
                    <div className="bg-blue-50/50 border border-blue-100 text-slate-700 text-sm p-3 rounded-lg flex gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>{rec.reasoningText}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t bg-slate-50/30 flex gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => handleAccept(rec.id)}
                    disabled={acceptRec.isPending || rejectRec.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" /> Approve Transfer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="shrink-0"
                    onClick={() => handleReject(rec.id)}
                    disabled={acceptRec.isPending || rejectRec.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {handledRecs.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Recent Decisions</h3>
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y">
                {handledRecs.slice(0, 5).map(rec => (
                  <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {rec.status === 'accepted' || rec.status === 'completed' ? (
                        <div className="bg-green-100 p-2 rounded-full"><Check className="h-4 w-4 text-green-600" /></div>
                      ) : (
                        <div className="bg-slate-100 p-2 rounded-full"><X className="h-4 w-4 text-slate-500" /></div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">
                          {rec.suggestedQuantity}x {rec.medicineName}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5">
                          {rec.sourceFacilityName} <ArrowRight className="h-3 w-3" /> {rec.targetFacilityName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge 
                        status={rec.status === 'accepted' || rec.status === 'completed' ? 'success' : 'default'} 
                        text={rec.status.toUpperCase()} 
                      />
                      {rec.generatedAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(rec.generatedAt), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
