import { api } from "encore.dev/api";
import db from "../db";
import { Squad } from "./types";

interface ListSquadsResponse {
  squads: Squad[];
}

// Retrieves all squads.
export const list = api<void, ListSquadsResponse>(
  { auth: true, expose: true, method: "GET", path: "/squads" },
  async () => {
    const rows = await db.queryAll<Squad>`
      SELECT 
        id,
        name,
        description,
        timezone,
        string_to_array(workdays, ',') as workdays,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM squads
      ORDER BY name
    `;

    return { squads: rows };
  }
);
