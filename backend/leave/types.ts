export type LeaveType = "Vacation" | "Sick" | "Public Holiday" | "Training";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: number;
  squadId: number;
  userId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  supportingDocs?: any;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
