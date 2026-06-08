export interface Activity {
  id?: number;
  categoryId: number;
  title: string;
  description?: string;
  lastDoneAt: string;
  cycleInDays: number;
}
