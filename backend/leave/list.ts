import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { LeaveRequest, LeaveStatus } from "./types";

interface ListLeaveRequest {
  squadId?: Query<number>;
  userId?: Query<string>;
  status?: Query<LeaveStatus>;
}

interface ListLeaveResponse {
  requests: LeaveRequest[];
}

// Retrieves leave requests with optional filters.
export const list = api<ListLeaveRequest, ListLeaveResponse>(
  { auth: true, expose: true, method: "GET", path: "/leave" },
  async (req) => {
    let query = `
      SELECT 
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
      FROM leave_requests
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

    if (req.status) {
      params.push(req.status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const rows = await db.rawQueryAll<LeaveRequest>(query, ...params);

    return { requests: rows };
  }
);
