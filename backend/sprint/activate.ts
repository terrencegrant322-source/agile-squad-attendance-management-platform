import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Sprint } from "./types";
import { logAudit } from "../audit/log";

interface ActivateSprintRequest {
  sprintId: number;
}

// Activates a sprint and deactivates all other sprints in the same squad.
export const activate = api<ActivateSprintRequest, Sprint>(
  { expose: true, method: "POST", path: "/sprints/:sprintId/activate" },
  async ({ sprintId }) => {
    const sprint = await db.queryRow<{ squadId: number }>`
      SELECT squad_id as "squadId" FROM sprints WHERE id = ${sprintId}
    `;

    if (!sprint) {
      throw APIError.notFound("sprint not found");
    }

    await db.exec`
      UPDATE sprints 
      SET is_active = false 
      WHERE squad_id = ${sprint.squadId} AND is_active = true
    `;

    const row = await db.queryRow<Sprint>`
      UPDATE sprints
      SET is_active = true
      WHERE id = ${sprintId}
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
      throw new Error("Failed to activate sprint");
    }

    await logAudit({
      userId: "system",
      action: "activate",
      entityType: "sprint",
      entityId: row.id,
      newData: row,
    });

    return row;
  }
);
