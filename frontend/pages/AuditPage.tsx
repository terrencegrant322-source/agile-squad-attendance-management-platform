import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export function AuditPage() {
  const backend = useBackend();
  
  const { data: auditData } = useQuery({
    queryKey: ["audit"],
    queryFn: () => backend.audit.list({}),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground mt-1">
          Complete history of all changes and actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {auditData?.logs && auditData.logs.length > 0 ? (
            <div className="space-y-2">
              {auditData.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {log.action} - {log.entityType}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by {log.userId}
                    </div>
                    {log.ipAddress && (
                      <div className="text-xs text-muted-foreground mt-1">
                        IP: {log.ipAddress}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), "MMM d, h:mm a")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No audit logs yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
