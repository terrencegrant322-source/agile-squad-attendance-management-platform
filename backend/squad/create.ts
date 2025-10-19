import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Squad } from "./types";
import { logAudit } from "../audit/log";

interface CreateSquadRequest {
  name: string;
  description?: string;
  timezone?: string;
  workdays?: string[];
}

// Creates a new squad.
export const create = api<CreateSquadRequest, Squad>(
  { auth: true, expose: true, method: "POST", path: "/squads" },
  async (req) => {
    const auth = getAuthData()!;
    const workdaysStr = (req.workdays || ["Mon", "Tue", "Wed", "Thu", "Fri"]).join(",");
    const timezone = req.timezone || "UTC";

    const row = await db.queryRow<Squad>`
      INSERT INTO squads (name, description, timezone, workdays)
      VALUES (${req.name}, ${req.description || null}, ${timezone}, ${workdaysStr})
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
      throw new Error("Failed to create squad");
    }

    await logAudit({
      userId: auth.userID,
      action: "create",
      entityType: "squad",
      entityId: row.id,
      newData: row,
    });

    return row;
  }
);
