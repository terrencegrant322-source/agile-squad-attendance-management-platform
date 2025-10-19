export type UserRole = "Admin" | "Squad Lead" | "Member" | "Viewer";

export interface Squad {
  id: number;
  name: string;
  description?: string;
  timezone: string;
  workdays: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SquadMember {
  id: number;
  squadId: number;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  joinedAt: Date;
}
