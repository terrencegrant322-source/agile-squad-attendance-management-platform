import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { AuditLogEntry } from "./types";

interface ListAuditLogsRequest {
  entityType?: Query<string>;
  entityId?: Query<number>;
  userId?: Query<string>;
  limit?: Query<number>;
}

interface ListAuditLogsResponse {
  logs: AuditLogEntry[];
}

// Retrieves audit log entries with optional filters.
export const list = api<ListAuditLogsRequest, ListAuditLogsResponse>(
  { expose: true, method: "GET", path: "/audit/logs" },
  async (req) => {
    let query = `
      SELECT 
        id,
        user_id as "userId",
        action,
        entity_type as "entityType",
        entity_id as "entityId",
        old_data as "oldData",
        new_data as "newData",
        ip_address as "ipAddress",
        created_at as "createdAt"
      FROM audit_log
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.entityType) {
      params.push(req.entityType);
      query += ` AND entity_type = $${params.length}`;
    }

    if (req.entityId) {
      params.push(req.entityId);
      query += ` AND entity_id = $${params.length}`;
    }

    if (req.userId) {
      params.push(req.userId);
      query += ` AND user_id = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const limit = req.limit || 100;
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const rows = await db.rawQueryAll<AuditLogEntry>(query, ...params);

    return { logs: rows };
  }
);
