import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { AttendanceRecord } from "./types";

interface ListAttendanceRequest {
  squadId?: Query<number>;
  userId?: Query<string>;
  sprintId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ListAttendanceResponse {
  records: AttendanceRecord[];
}

// Retrieves attendance records with optional filters.
export const list = api<ListAttendanceRequest, ListAttendanceResponse>(
  { auth: true, expose: true, method: "GET", path: "/attendance" },
  async (req) => {
    let query = `
      SELECT 
        id,
        squad_id as "squadId",
        user_id as "userId",
        sprint_id as "sprintId",
        check_in_time as "checkInTime",
        check_out_time as "checkOutTime",
        work_mode as "workMode",
        location_data as "locationData",
        ip_address as "ipAddress",
        notes,
        is_partial_day as "isPartialDay",
        tags,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM attendance_records
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.squadId) {
      params.push(req.squadId);
      query += ` AND squad_id = $${params.length}`;
    }

    if (req.userId) {
      params.push(req.userId);
      query += ` AND user_id = $${params.length}`;
    }

    if (req.sprintId) {
      params.push(req.sprintId);
      query += ` AND sprint_id = $${params.length}`;
    }

    if (req.startDate) {
      params.push(req.startDate);
      query += ` AND check_in_time >= $${params.length}::timestamptz`;
    }

    if (req.endDate) {
      params.push(req.endDate);
      query += ` AND check_in_time <= $${params.length}::timestamptz`;
    }

    query += ` ORDER BY check_in_time DESC LIMIT 100`;

    const rows = await db.rawQueryAll<AttendanceRecord>(query, ...params);

    return { records: rows };
  }
);
