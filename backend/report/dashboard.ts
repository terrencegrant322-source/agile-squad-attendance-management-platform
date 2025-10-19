import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DashboardRequest {
  squadId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface AttendanceSummary {
  totalCheckIns: number;
  averageHoursPerDay: number;
  remoteCount: number;
  officeCount: number;
  activeMembers: number;
  onLeaveCount: number;
}

// Retrieves dashboard metrics for attendance.
export const dashboard = api<DashboardRequest, AttendanceSummary>(
  { auth: true, expose: true, method: "GET", path: "/reports/dashboard" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (req.squadId) {
      params.push(req.squadId);
      whereClause += ` AND squad_id = $${params.length}`;
    }

    if (req.startDate) {
      params.push(req.startDate);
      whereClause += ` AND check_in_time >= $${params.length}::timestamptz`;
    }

    if (req.endDate) {
      params.push(req.endDate);
      whereClause += ` AND check_in_time <= $${params.length}::timestamptz`;
    }

    const stats = await db.rawQueryRow<{
      totalCheckIns: number;
      averageHoursPerDay: number;
      remoteCount: number;
      officeCount: number;
      activeMembers: number;
    }>(`
      SELECT 
        COUNT(*) as "totalCheckIns",
        COALESCE(AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600), 0) as "averageHoursPerDay",
        COUNT(*) FILTER (WHERE work_mode = 'Remote') as "remoteCount",
        COUNT(*) FILTER (WHERE work_mode = 'Office') as "officeCount",
        COUNT(DISTINCT user_id) as "activeMembers"
      FROM attendance_records
      ${whereClause}
    `, ...params);

    let leaveWhereClause = "WHERE status = 'Approved' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE";
    const leaveParams: any[] = [];

    if (req.squadId) {
      leaveParams.push(req.squadId);
      leaveWhereClause += ` AND squad_id = $${leaveParams.length}`;
    }

    const leaveStats = await db.rawQueryRow<{ onLeaveCount: number }>(`
      SELECT COUNT(DISTINCT user_id) as "onLeaveCount"
      FROM leave_requests
      ${leaveWhereClause}
    `, ...leaveParams);

    return {
      totalCheckIns: stats?.totalCheckIns || 0,
      averageHoursPerDay: stats?.averageHoursPerDay || 0,
      remoteCount: stats?.remoteCount || 0,
      officeCount: stats?.officeCount || 0,
      activeMembers: stats?.activeMembers || 0,
      onLeaveCount: leaveStats?.onLeaveCount || 0,
    };
  }
);
