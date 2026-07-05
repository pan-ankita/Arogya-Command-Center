import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetDoctors, 
  useGetAttendance,
  useMarkAttendance,
  getGetAttendanceQueryKey,
  AttendanceInputStatus
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { Stethoscope, Clock, Check, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function FacilityAttendance() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: doctors, isLoading: loadingDoctors } = useGetDoctors(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetAttendanceQueryKey({ facilityId, date: today }) } }
  );

  const { data: attendance, isLoading: loadingAttendance } = useGetAttendance(
    { facilityId, date: today },
    { query: { enabled: !!facilityId, queryKey: getGetAttendanceQueryKey({ facilityId, date: today }) } }
  );

  const markAttendance = useMarkAttendance();

  const handleMark = (doctorId: number, status: AttendanceInputStatus) => {
    const checkInTime = status === 'present' || status === 'late' ? new Date().toISOString() : undefined;
    
    markAttendance.mutate(
      {
        data: {
          doctorId,
          facilityId,
          status,
          attendanceDate: today,
          checkInTime
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAttendanceQueryKey({ facilityId, date: today }) });
          toast({
            title: "Attendance Recorded",
            description: `Marked as ${status}`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to record attendance.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const getAttendanceRecord = (doctorId: number) => {
    return attendance?.find(a => a.doctorId === doctorId);
  };

  const isLoading = loadingDoctors || loadingAttendance;

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Doctor Attendance</h2>
          <p className="text-muted-foreground">Mark daily presence for {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><SkeletonList /></div>
            ) : !doctors || doctors.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Stethoscope className="h-12 w-12 text-slate-200 mb-4" />
                <p>No doctors assigned to this facility.</p>
              </div>
            ) : (
              <div className="divide-y">
                {doctors.map(doctor => {
                  const record = getAttendanceRecord(doctor.id);
                  const isPresent = record?.status === 'present';
                  const isAbsent = record?.status === 'absent';
                  const isLate = record?.status === 'late';
                  
                  return (
                    <div key={doctor.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          
                          {record?.checkInTime && (
                            <div className="flex items-center text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-flex px-2 py-0.5 rounded">
                              <Clock className="h-3 w-3 mr-1" />
                              Checked in: {format(new Date(record.checkInTime), 'h:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <Button
                          variant={isPresent ? "default" : "outline"}
                          size="sm"
                          className={isPresent ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600 hover:border-green-200"}
                          onClick={() => handleMark(doctor.id, 'present')}
                          disabled={markAttendance.isPending}
                          data-testid={`btn-present-${doctor.id}`}
                        >
                          <Check className="mr-1 h-4 w-4" /> Present
                        </Button>
                        <Button
                          variant={isLate ? "default" : "outline"}
                          size="sm"
                          className={isLate ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"}
                          onClick={() => handleMark(doctor.id, 'late')}
                          disabled={markAttendance.isPending}
                          data-testid={`btn-late-${doctor.id}`}
                        >
                          <AlertCircle className="mr-1 h-4 w-4" /> Late
                        </Button>
                        <Button
                          variant={isAbsent ? "default" : "outline"}
                          size="sm"
                          className={isAbsent ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"}
                          onClick={() => handleMark(doctor.id, 'absent')}
                          disabled={markAttendance.isPending}
                          data-testid={`btn-absent-${doctor.id}`}
                        >
                          <X className="mr-1 h-4 w-4" /> Absent
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
