import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetTests, 
  useUpdateTestStatus,
  getGetTestsQueryKey,
  TestAvailabilityStatus
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { TestTube, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { format } from "date-fns";

export default function FacilityTests() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tests, isLoading } = useGetTests(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetTestsQueryKey({ facilityId }) } }
  );

  const updateTestStatus = useUpdateTestStatus();

  const handleStatusChange = (id: number, status: TestAvailabilityStatus) => {
    updateTestStatus.mutate(
      {
        id,
        data: { status }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTestsQueryKey({ facilityId }) });
          toast({
            title: "Status Updated",
            description: `Test status changed to ${status.replace('_', ' ')}`,
          });
        },
        onError: () => {
          toast({
            title: "Update Failed",
            description: "Could not update test status.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Diagnostic Tests</h2>
          <p className="text-muted-foreground">Update availability and equipment status.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Checklist</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><SkeletonList /></div>
            ) : !tests || tests.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <TestTube className="h-12 w-12 text-slate-200 mb-4" />
                <p>No tests configured for this facility.</p>
              </div>
            ) : (
              <div className="divide-y">
                {tests.map(test => {
                  const isAvailable = test.status === 'available';
                  const isUnavailable = test.status === 'unavailable';
                  const isEquipDown = test.status === 'equipment_down';
                  
                  return (
                    <div key={test.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-background/50">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <TestTube className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{test.testName}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500 bg-muted px-2 py-0.5 rounded">
                              {test.category || 'General'}
                            </span>
                            {test.lastCheckedAt && (
                              <span className="text-xs text-muted-foreground">
                                Updated {format(new Date(test.lastCheckedAt), 'MMM d, h:mm a')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        <Button
                          variant={isAvailable ? "default" : "outline"}
                          size="sm"
                          className={isAvailable ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600 hover:border-green-200"}
                          onClick={() => handleStatusChange(test.id, 'available')}
                          disabled={updateTestStatus.isPending}
                          data-testid={`btn-test-avail-${test.id}`}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Available
                        </Button>
                        <Button
                          variant={isUnavailable ? "default" : "outline"}
                          size="sm"
                          className={isUnavailable ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"}
                          onClick={() => handleStatusChange(test.id, 'unavailable')}
                          disabled={updateTestStatus.isPending}
                          data-testid={`btn-test-unavail-${test.id}`}
                        >
                          <XCircle className="mr-1 h-4 w-4" /> Unavailable
                        </Button>
                        <Button
                          variant={isEquipDown ? "default" : "outline"}
                          size="sm"
                          className={isEquipDown ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"}
                          onClick={() => handleStatusChange(test.id, 'equipment_down')}
                          disabled={updateTestStatus.isPending}
                          data-testid={`btn-test-equip-${test.id}`}
                        >
                          <Wrench className="mr-1 h-4 w-4" /> Equip Down
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FacilityLayout>
  );
}
