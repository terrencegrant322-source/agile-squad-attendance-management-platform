import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Squad } from "./types";
import { logAudit } from "../audit/log";

interface UpdateSquadRequest {
  id: number;
  name?: string;
  description?: string;
  timezone?: string;
  workdays?: string[];
}

// Updates a squad.
export const update = api<UpdateSquadRequest, Squad>(
  { expose: true, method: "PUT", path: "/squads/:id" },
  async (req) => {
    const existing = await db.queryRow<Squad>`
      SELECT * FROM squads WHERE id = ${req.id}
    `;

    if (!existing) {
      throw APIError.notFound("squad not found");
    }

    const workdaysStr = req.workdays ? req.workdays.join(",") : undefined;

    const row = await db.queryRow<Squad>`
      UPDATE squads
      SET
        name = COALESCE(${req.name || null}, name),
        description = COALESCE(${req.description || null}, description),
        timezone = COALESCE(${req.timezone || null}, timezone),
        workdays = COALESCE(${workdaysStr || null}, workdays),
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING 
        id,
        name,
        description,
        timezone,
        string_to_array(workdays, ',') as workdays,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    if (!row) {
      throw new Error("Failed to update squad");
    }

    await logAudit({
      userId: "system",
      action: "update",
      entityType: "squad",
      entityId: row.id,
      oldData: existing,
      newData: row,
    });

    return row;
  }
);
