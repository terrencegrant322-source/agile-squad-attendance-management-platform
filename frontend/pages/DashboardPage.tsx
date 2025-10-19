import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Home, Plane, TrendingUp } from "lucide-react";

export function DashboardPage() {
  const backend = useBackend();
  
  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => backend.report.dashboard({}),
  });

  const { data: squadsData } = useQuery({
    queryKey: ["squads"],
    queryFn: () => backend.squad.list(),
  });

  const metrics = [
    {
      title: "Total Check-ins",
      value: stats?.totalCheckIns || 0,
      icon: Clock,
      description: "Today's check-ins",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers || 0,
      icon: Users,
      description: "Currently active",
    },
    {
      title: "Office Attendance",
      value: stats?.officeCount || 0,
      icon: Home,
      description: "In office today",
    },
    {
      title: "Remote Workers",
      value: stats?.remoteCount || 0,
      icon: TrendingUp,
      description: "Working remotely",
    },
    {
      title: "On Leave",
      value: stats?.onLeaveCount || 0,
      icon: Plane,
      description: "Currently on leave",
    },
    {
      title: "Avg Hours/Day",
      value: stats?.averageHoursPerDay?.toFixed(1) || "0.0",
      icon: Clock,
      description: "Average work hours",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of squad attendance and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Squads</CardTitle>
        </CardHeader>
        <CardContent>
          {squadsData?.squads && squadsData.squads.length > 0 ? (
            <div className="space-y-2">
              {squadsData.squads.map((squad) => (
                <div
                  key={squad.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{squad.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {squad.description || "No description"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {squad.timezone}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No squads yet. Create one to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
