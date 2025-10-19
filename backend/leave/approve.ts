import { api, APIError } from "encore.dev/api";
import db from "../db";
import { LeaveRequest } from "./types";
import { logAudit } from "../audit/log";

interface ApproveLeaveRequest {
  leaveRequestId: number;
  reviewerId: string;
  approved: boolean;
  reviewNotes?: string;
}

// Approves or rejects a leave request.
export const approve = api<ApproveLeaveRequest, LeaveRequest>(
  { expose: true, method: "POST", path: "/leave/:leaveRequestId/approve" },
  async (req) => {
    const existing = await db.queryRow<LeaveRequest>`
      SELECT * FROM leave_requests WHERE id = ${req.leaveRequestId}
    `;

    if (!existing) {
      throw APIError.notFound("leave request not found");
    }

    if (existing.status !== "Pending") {
      throw APIError.failedPrecondition("leave request already reviewed");
    }

    const newStatus = req.approved ? "Approved" : "Rejected";

    const row = await db.queryRow<LeaveRequest>`
      UPDATE leave_requests
      SET 
        status = ${newStatus},
        reviewed_by = ${req.reviewerId},
        reviewed_at = NOW(),
        review_notes = ${req.reviewNotes || null},
        updated_at = NOW()
      WHERE id = ${req.leaveRequestId}
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
      throw new Error("Failed to approve leave request");
    }

    await logAudit({
      userId: req.reviewerId,
      action: "approve_leave",
      entityType: "leave_request",
      entityId: row.id,
      oldData: existing,
      newData: row,
    });

    return row;
  }
);
