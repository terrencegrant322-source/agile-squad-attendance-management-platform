export interface AuditLogEntry {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId: number;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  createdAt: Date;
}
