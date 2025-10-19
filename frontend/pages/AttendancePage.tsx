import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { AttendanceRecord, WorkMode } from "~backend/attendance/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, LogOut, MapPin, Home, Laptop, Building } from "lucide-react";
import { format } from "date-fns";

export function AttendancePage() {
  const backend = useBackend();
  const [selectedSquadId, setSelectedSquadId] = useState<string>("");
  const [workMode, setWorkMode] = useState<WorkMode>("Office");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: squadsData } = useQuery({
    queryKey: ["squads"],
    queryFn: () => backend.squad.list(),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", selectedSquadId],
    queryFn: () => backend.attendance.list({ 
      squadId: selectedSquadId ? parseInt(selectedSquadId) : undefined 
    }),
    enabled: !!selectedSquadId,
  });

  const checkIn = useMutation({
    mutationFn: () => backend.attendance.checkIn({
      squadId: parseInt(selectedSquadId),
      workMode,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: "Checked in successfully",
      });
    },
    onError: (error) => {
      console.error("Check-in failed:", error);
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive",
      });
    },
  });

  const checkOut = useMutation({
    mutationFn: (attendanceId: number) => backend.attendance.checkOut({
      attendanceId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: "Checked out successfully",
      });
    },
    onError: (error) => {
      console.error("Check-out failed:", error);
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive",
      });
    },
  });

  const todayRecords = attendanceData?.records.filter((r) => {
    const recordDate = new Date(r.checkInTime);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  }) || [];

  const activeRecord = todayRecords.find((r) => !r.checkOutTime);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Track your daily check-ins and check-outs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Squad</label>
              <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a squad" />
                </SelectTrigger>
                <SelectContent>
                  {squadsData?.squads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id.toString()}>
                      {squad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Work Mode</label>
              <Select value={workMode} onValueChange={(v) => setWorkMode(v as WorkMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Office
                    </div>
                  </SelectItem>
                  <SelectItem value="Remote">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Remote
                    </div>
                  </SelectItem>
                  <SelectItem value="Client Site">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Client Site
                    </div>
                  </SelectItem>
                  <SelectItem value="OOO">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      Out of Office
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => checkIn.mutate()}
              disabled={!selectedSquadId || !!activeRecord}
              className="flex-1"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button
              onClick={() => activeRecord && checkOut.mutate(activeRecord.id)}
              disabled={!activeRecord}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Records</CardTitle>
        </CardHeader>
        <CardContent>
          {todayRecords.length > 0 ? (
            <div className="space-y-2">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {format(new Date(record.checkInTime), "h:mm a")}
                        {record.checkOutTime && (
                          <> - {format(new Date(record.checkOutTime), "h:mm a")}</>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.workMode}
                      </div>
                    </div>
                  </div>
                  {!record.checkOutTime && (
                    <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium">
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No records for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
