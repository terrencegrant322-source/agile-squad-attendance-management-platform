import db from "../db";

interface LogAuditParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: number;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  await db.exec`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_data, new_data, ip_address)
    VALUES (
      ${params.userId},
      ${params.action},
      ${params.entityType},
      ${params.entityId},
      ${params.oldData ? JSON.stringify(params.oldData) : null},
      ${params.newData ? JSON.stringify(params.newData) : null},
      ${params.ipAddress || null}
    )
  `;
}
