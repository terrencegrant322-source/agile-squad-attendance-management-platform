import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

export function ReportsPage() {
  const backend = useBackend();
  const [selectedSquadId, setSelectedSquadId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: squadsData } = useQuery({
    queryKey: ["squads"],
    queryFn: () => backend.squad.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard", selectedSquadId, startDate, endDate],
    queryFn: () => backend.report.dashboard({
      squadId: selectedSquadId ? parseInt(selectedSquadId) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into attendance patterns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Squad</Label>
              <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
                <SelectTrigger>
                  <SelectValue placeholder="All squads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Squads</SelectItem>
                  {squadsData?.squads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id.toString()}>
                      {squad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCheckIns || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageHoursPerDay?.toFixed(1) || "0.0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remote %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCheckIns
                ? ((stats.remoteCount / stats.totalCheckIns) * 100).toFixed(0)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
