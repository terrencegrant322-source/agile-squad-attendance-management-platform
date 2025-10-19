import { api } from "encore.dev/api";
import db from "../db";

interface WorkModeStatus {
  userId: string;
  squadId: number;
  currentMode: string;
  updatedAt: Date;
}

interface CurrentStatusRequest {
  squadId: number;
}

interface CurrentStatusResponse {
  statuses: WorkModeStatus[];
}

// Retrieves the current work mode status for all members of a squad.
export const currentStatus = api<CurrentStatusRequest, CurrentStatusResponse>(
  { expose: true, method: "GET", path: "/attendance/status/:squadId" },
  async ({ squadId }) => {
    const rows = await db.queryAll<WorkModeStatus>`
      SELECT 
        user_id as "userId",
        squad_id as "squadId",
        current_mode as "currentMode",
        updated_at as "updatedAt"
      FROM work_mode_status
      WHERE squad_id = ${squadId}
      ORDER BY updated_at DESC
    `;

    return { statuses: rows };
  }
);
