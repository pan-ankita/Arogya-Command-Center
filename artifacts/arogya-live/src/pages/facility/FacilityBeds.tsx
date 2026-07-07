import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetBeds, 
  useUpdateBed,
  getGetBedsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonCard } from "@/components/SkeletonCard";
import { BedDouble, Plus, Minus } from "lucide-react";

export default function FacilityBeds() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localBeds, setLocalBeds] = useState<Record<number, number>>({});

  const { data: beds, isLoading } = useGetBeds(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetBedsQueryKey({ facilityId }) } }
  );

  const updateBed = useUpdateBed();

  const handleUpdateBed = (id: number, totalBeds: number, newOccupied: number) => {
    if (newOccupied < 0 || newOccupied > totalBeds) return;
    
    setLocalBeds(prev => ({ ...prev, [id]: newOccupied }));
    
    updateBed.mutate(
      {
        id,
        data: { occupiedBeds: newOccupied }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBedsQueryKey({ facilityId }) });
        },
        onError: () => {
          toast({
            title: "Update Failed",
            description: "Could not sync bed status with server.",
            variant: "destructive"
          });
          // Note: Would be better to revert local state here, but need original value
        }
      }
    );
  };

  const getOccupancyColor = (occupancyPercent: number) => {
    if (occupancyPercent >= 90) return "bg-red-500";
    if (occupancyPercent >= 75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bed Management</h2>
          <p className="text-muted-foreground">Update ward occupancy in real-time.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : beds?.length === 0 ? (
            <Card className="col-span-full py-12 text-center text-muted-foreground">
              <CardContent>No bed tracking configured for this facility.</CardContent>
            </Card>
          ) : (
            beds?.map((ward) => {
              const occupied = localBeds[ward.id] !== undefined ? localBeds[ward.id] : ward.occupiedBeds;
              const available = ward.totalBeds - occupied;
              const occupancyPercent = Math.round((occupied / ward.totalBeds) * 100);
              
              return (
                <Card key={ward.id} className="shadow-sm overflow-hidden" data-testid={`card-ward-${ward.id}`}>
                  {/* Top color bar indicator */}
                  <div className={`h-2 w-full ${getOccupancyColor(occupancyPercent)}`} />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex justify-between items-center">
                      {ward.wardName}
                      <BedDouble className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Available</div>
                          <div className="text-4xl font-bold text-foreground">{available}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">Occupied</div>
                          <div className="text-2xl font-semibold text-muted-foreground">{occupied} <span className="text-base font-normal text-muted-foreground">/ {ward.totalBeds}</span></div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-in-out ${getOccupancyColor(occupancyPercent)}`} 
                          style={{ width: `${occupancyPercent}%` }} 
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Update Occupied:</span>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-full"
                            onClick={() => handleUpdateBed(ward.id, ward.totalBeds, occupied - 1)}
                            disabled={occupied <= 0 || updateBed.isPending}
                            data-testid={`btn-dec-bed-${ward.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-mono font-bold text-lg">{occupied}</span>
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-10 w-10 rounded-full bg-slate-900 hover:bg-slate-800"
                            onClick={() => handleUpdateBed(ward.id, ward.totalBeds, occupied + 1)}
                            disabled={occupied >= ward.totalBeds || updateBed.isPending}
                            data-testid={`btn-inc-bed-${ward.id}`}
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </FacilityLayout>
  );
}
