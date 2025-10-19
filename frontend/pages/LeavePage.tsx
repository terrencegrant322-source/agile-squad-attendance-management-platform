import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { LeaveType } from "~backend/leave/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export function LeavePage() {
  const backend = useBackend();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaveData } = useQuery({
    queryKey: ["leave"],
    queryFn: () => backend.leave.list({}),
  });

  const { data: squadsData } = useQuery({
    queryKey: ["squads"],
    queryFn: () => backend.squad.list(),
  });

  const requestLeave = useMutation({
    mutationFn: (data: {
      squadId: number;
      leaveType: LeaveType;
      startDate: Date;
      endDate: Date;
      reason: string;
    }) => backend.leave.request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave"] });
      setIsRequestOpen(false);
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to request leave:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });

  const handleRequestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    requestLeave.mutate({
      squadId: parseInt(formData.get("squadId") as string),
      leaveType: formData.get("leaveType") as LeaveType,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      reason: formData.get("reason") as string,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Request and track time off
          </p>
        </div>
        <Button onClick={() => setIsRequestOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="space-y-3">
        {leaveData?.requests && leaveData.requests.length > 0 ? (
          leaveData.requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-medium text-foreground">
                        {request.leaveType}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(request.startDate), "MMM d")} -{" "}
                        {format(new Date(request.endDate), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm mt-2">{request.reason}</p>
                      {request.reviewNotes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Review: {request.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {request.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No leave requests yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="squadId">Squad</Label>
              <Select name="squadId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select squad" />
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
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select name="leaveType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Public Holiday">Public Holiday</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" required />
            </div>
            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
