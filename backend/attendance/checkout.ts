import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { AttendanceRecord } from "./types";
import { logAudit } from "../audit/log";

interface CheckOutRequest {
  attendanceId: number;
  notes?: string;
}

// Records a check-out for an attendance record.
export const checkOut = api<CheckOutRequest, AttendanceRecord>(
  { auth: true, expose: true, method: "POST", path: "/attendance/checkout" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const existing = await db.queryRow<AttendanceRecord>`
      SELECT * FROM attendance_records WHERE id = ${req.attendanceId}
    `;

    if (!existing) {
      throw APIError.notFound("attendance record not found");
    }

    if (existing.userId !== userId) {
      throw APIError.permissionDenied("cannot check out for another user");
    }

    if (existing.checkOutTime) {
      throw APIError.failedPrecondition("already checked out");
    }

    const row = await db.queryRow<AttendanceRecord>`
      UPDATE attendance_records
      SET 
        check_out_time = NOW(),
        notes = COALESCE(${req.notes || null}, notes),
        updated_at = NOW()
      WHERE id = ${req.attendanceId}
      RETURNING 
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
    `;

    if (!row) {
      throw new Error("Failed to record check-out");
    }

    await logAudit({
      userId: userId,
      action: "checkout",
      entityType: "attendance",
      entityId: row.id,
      oldData: existing,
      newData: row,
    });

    return row;
  }
);
