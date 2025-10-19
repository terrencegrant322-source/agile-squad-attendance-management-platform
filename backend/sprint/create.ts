import { api } from "encore.dev/api";
import db from "../db";
import { Sprint } from "./types";
import { logAudit } from "../audit/log";

interface CreateSprintRequest {
  squadId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

// Creates a new sprint for a squad.
export const create = api<CreateSprintRequest, Sprint>(
  { expose: true, method: "POST", path: "/sprints" },
  async (req) => {
    if (req.isActive) {
      await db.exec`
        UPDATE sprints 
        SET is_active = false 
        WHERE squad_id = ${req.squadId} AND is_active = true
      `;
    }

    const row = await db.queryRow<Sprint>`
      INSERT INTO sprints (squad_id, name, start_date, end_date, is_active)
      VALUES (${req.squadId}, ${req.name}, ${req.startDate}, ${req.endDate}, ${req.isActive || false})
      RETURNING 
        id,
        squad_id as "squadId",
        name,
        start_date as "startDate",
        end_date as "endDate",
        is_active as "isActive",
        created_at as "createdAt"
    `;

    if (!row) {
      throw new Error("Failed to create sprint");
    }

    await logAudit({
      userId: "system",
      action: "create",
      entityType: "sprint",
      entityId: row.id,
      newData: row,
    });

    return row;
  }
);
