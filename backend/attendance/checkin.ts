import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { AttendanceRecord, WorkMode } from "./types";
import { logAudit } from "../audit/log";

interface CheckInRequest {
  squadId: number;
  workMode: WorkMode;
  locationData?: any;
  ipAddress?: string;
  notes?: string;
  tags?: string[];
}

// Records a check-in for a squad member.
export const checkIn = api<CheckInRequest, AttendanceRecord>(
  { auth: true, expose: true, method: "POST", path: "/attendance/checkin" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const activeSprint = await db.queryRow<{ id: number }>`
      SELECT id FROM sprints 
      WHERE squad_id = ${req.squadId} AND is_active = true
      LIMIT 1
    `;

    const row = await db.queryRow<AttendanceRecord>`
      INSERT INTO attendance_records (
        squad_id, user_id, sprint_id, check_in_time, work_mode,
        location_data, ip_address, notes, tags, is_partial_day
      )
      VALUES (
        ${req.squadId}, ${userId}, ${activeSprint?.id || null}, NOW(), ${req.workMode},
        ${req.locationData ? JSON.stringify(req.locationData) : null},
        ${req.ipAddress || null}, ${req.notes || null},
        ${req.tags || null}, false
      )
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
      throw new Error("Failed to record check-in");
    }

    await db.exec`
      INSERT INTO work_mode_status (user_id, squad_id, current_mode, updated_at)
      VALUES (${userId}, ${req.squadId}, ${req.workMode}, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET current_mode = ${req.workMode}, squad_id = ${req.squadId}, updated_at = NOW()
    `;

    await logAudit({
      userId: userId,
      action: "checkin",
      entityType: "attendance",
      entityId: row.id,
      newData: row,
      ipAddress: req.ipAddress,
    });

    return row;
  }
);
