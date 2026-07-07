import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetCalamities, 
  useDeclareCalamity,
  useResolveCalamity,
  getGetCalamitiesQueryKey,
  CalamityInputType,
  CalamityInputSeverity
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { AlertOctagon, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FacilityCalamity() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [type, setType] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [description, setDescription] = useState("");

  const { data: calamities, isLoading } = useGetCalamities(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetCalamitiesQueryKey({ facilityId }) } }
  );

  const declareCalamity = useDeclareCalamity();
  const resolveCalamity = useResolveCalamity();

  const activeCalamities = calamities?.filter(c => c.isActive) || [];
  const pastCalamities = calamities?.filter(c => !c.isActive) || [];

  const handleDeclare = () => {
    if (!type || !severity) return;

    declareCalamity.mutate(
      {
        data: {
          facilityId,
          type: type as CalamityInputType,
          severity: severity as CalamityInputSeverity,
          description
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCalamitiesQueryKey({ facilityId }) });
          toast({
            title: "Calamity Declared",
            description: "District admin has been notified immediately.",
            variant: "destructive"
          });
          setType("");
          setSeverity("");
          setDescription("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to declare calamity.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleResolve = (id: number) => {
    resolveCalamity.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCalamitiesQueryKey({ facilityId }) });
          toast({
            title: "Calamity Resolved",
            description: "The situation has been marked as resolved.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to resolve calamity.",
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
          <h2 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
            <AlertOctagon className="h-8 w-8" />
            Calamity Declaration
          </h2>
          <p className="text-muted-foreground">Report critical emergencies that require immediate district intervention.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-red-200 shadow-md">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-red-700">Declare Emergency</CardTitle>
              <CardDescription>
                This will trigger SMS/app alerts to district authorities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type of Emergency</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="outbreak">Disease Outbreak</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure Collapse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Immediate threat to life/operations)</SelectItem>
                    <SelectItem value="medium">Medium (Significant disruption)</SelectItem>
                    <SelectItem value="low">Low (Contained but requires attention)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Details (Optional but recommended)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the situation, required resources, casualties..." 
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-background border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white" 
                    disabled={!type || !severity || declareCalamity.isPending}
                    data-testid="btn-declare"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Declare Calamity
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will immediately alert all district administrators and potentially mobilize emergency services. Do not use this for routine issues.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeclare} className="bg-red-600 hover:bg-red-700 text-white">
                      Yes, Declare Emergency
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Active Emergencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonList />
                ) : activeCalamities.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                    <p>No active emergencies reported.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCalamities.map(cal => (
                      <div key={cal.id} className="p-4 rounded-xl border border-red-200 bg-red-50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-red-900 capitalize">{cal.type}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                            cal.severity === 'high' ? 'bg-red-600 text-white' : 
                            cal.severity === 'medium' ? 'bg-amber-500 text-white' : 
                            'bg-blue-500 text-white'
                          }`}>
                            {cal.severity}
                          </span>
                        </div>
                        <p className="text-sm text-red-800 mb-3">{cal.description || "No description provided."}</p>
                        <div className="flex justify-between items-center text-xs text-red-700">
                          <span>Reported: {format(new Date(cal.triggeredAt!), 'MMM d, h:mm a')}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs bg-card text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            onClick={() => handleResolve(cal.id)}
                            disabled={resolveCalamity.isPending}
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {pastCalamities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-muted-foreground">Past Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastCalamities.slice(0, 3).map(cal => (
                      <div key={cal.id} className="p-3 rounded-lg border bg-background flex justify-between items-center">
                        <div>
                          <div className="font-medium capitalize text-muted-foreground">{cal.type}</div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(cal.triggeredAt!), 'MMM d, yyyy')} - {format(new Date(cal.resolvedAt!), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </FacilityLayout>
  );
}
