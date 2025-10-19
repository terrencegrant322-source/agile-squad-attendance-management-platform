export type WorkMode = "Office" | "Remote" | "Client Site" | "OOO";

export interface AttendanceRecord {
  id: number;
  squadId: number;
  userId: string;
  sprintId?: number;
  checkInTime: Date;
  checkOutTime?: Date;
  workMode: WorkMode;
  locationData?: any;
  ipAddress?: string;
  notes?: string;
  isPartialDay: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
