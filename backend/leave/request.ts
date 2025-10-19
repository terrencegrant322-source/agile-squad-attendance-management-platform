import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { LeaveRequest, LeaveType } from "./types";
import { logAudit } from "../audit/log";

interface CreateLeaveRequest {
  squadId: number;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  supportingDocs?: any;
}

// Creates a new leave request.
export const request = api<CreateLeaveRequest, LeaveRequest>(
  { auth: true, expose: true, method: "POST", path: "/leave/request" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const row = await db.queryRow<LeaveRequest>`
      INSERT INTO leave_requests (
        squad_id, user_id, leave_type, start_date, end_date, reason, supporting_docs, status
      )
      VALUES (
        ${req.squadId}, ${userId}, ${req.leaveType}, ${req.startDate}, ${req.endDate},
        ${req.reason}, ${req.supportingDocs ? JSON.stringify(req.supportingDocs) : null}, 'Pending'
      )
      RETURNING 
        id,
        squad_id as "squadId",
        user_id as "userId",
        leave_type as "leaveType",
        start_date as "startDate",
        end_date as "endDate",
        reason,
        supporting_docs as "supportingDocs",
        status,
        reviewed_by as "reviewedBy",
        reviewed_at as "reviewedAt",
        review_notes as "reviewNotes",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    if (!row) {
      throw new Error("Failed to create leave request");
    }

    await logAudit({
      userId: userId,
      action: "create",
      entityType: "leave_request",
      entityId: row.id,
      newData: row,
    });

    return row;
  }
);
