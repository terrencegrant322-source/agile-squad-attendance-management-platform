import { api } from "encore.dev/api";
import db from "../db";
import { Sprint } from "./types";

interface ListSprintsRequest {
  squadId: number;
}

interface ListSprintsResponse {
  sprints: Sprint[];
}

// Retrieves all sprints for a squad.
export const list = api<ListSprintsRequest, ListSprintsResponse>(
  { expose: true, method: "GET", path: "/sprints/:squadId" },
  async ({ squadId }) => {
    const rows = await db.queryAll<Sprint>`
      SELECT 
        id,
        squad_id as "squadId",
        name,
        start_date as "startDate",
        end_date as "endDate",
        is_active as "isActive",
        created_at as "createdAt"
      FROM sprints
      WHERE squad_id = ${squadId}
      ORDER BY start_date DESC
    `;

    return { sprints: rows };
  }
);
