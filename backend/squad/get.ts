import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Squad } from "./types";

interface GetSquadRequest {
  id: number;
}

// Retrieves a squad by ID.
export const get = api<GetSquadRequest, Squad>(
  { expose: true, method: "GET", path: "/squads/:id" },
  async ({ id }) => {
    const row = await db.queryRow<Squad>`
      SELECT 
        id,
        name,
        description,
        timezone,
        string_to_array(workdays, ',') as workdays,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM squads
      WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("squad not found");
    }

    return row;
  }
);
