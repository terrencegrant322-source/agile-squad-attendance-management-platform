export interface Sprint {
  id: number;
  squadId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}
