import { api } from "encore.dev/api";
import db from "../db";
import { SquadMember } from "./types";

interface ListMembersRequest {
  squadId: number;
}

interface ListMembersResponse {
  members: SquadMember[];
}

// Retrieves all members of a squad.
export const listMembers = api<ListMembersRequest, ListMembersResponse>(
  { expose: true, method: "GET", path: "/squads/:squadId/members" },
  async ({ squadId }) => {
    const rows = await db.queryAll<SquadMember>`
      SELECT 
        id,
        squad_id as "squadId",
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        role,
        joined_at as "joinedAt"
      FROM squad_members
      WHERE squad_id = ${squadId}
      ORDER BY user_name
    `;

    return { members: rows };
  }
);
