import { api, APIError } from "encore.dev/api";
import db from "../db";
import { SquadMember } from "./types";
import { logAudit } from "../audit/log";

interface AddMemberRequest {
  squadId: number;
  userId: string;
  userName: string;
  userEmail: string;
  role: "Admin" | "Squad Lead" | "Member" | "Viewer";
}

// Adds a member to a squad.
export const addMember = api<AddMemberRequest, SquadMember>(
  { expose: true, method: "POST", path: "/squads/:squadId/members" },
  async (req) => {
    const squad = await db.queryRow`SELECT id FROM squads WHERE id = ${req.squadId}`;
    if (!squad) {
      throw APIError.notFound("squad not found");
    }

    const row = await db.queryRow<SquadMember>`
      INSERT INTO squad_members (squad_id, user_id, user_name, user_email, role)
      VALUES (${req.squadId}, ${req.userId}, ${req.userName}, ${req.userEmail}, ${req.role})
      ON CONFLICT (squad_id, user_id) DO UPDATE
      SET role = ${req.role}
      RETURNING 
        id,
        squad_id as "squadId",
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        role,
        joined_at as "joinedAt"
    `;

    if (!row) {
      throw new Error("Failed to add member");
    }

    await logAudit({
      userId: req.userId,
      action: "add_member",
      entityType: "squad",
      entityId: req.squadId,
      newData: row,
    });

    return row;
  }
);
