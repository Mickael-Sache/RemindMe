export interface Activity {
  id?: number;
  categoryId: number;
  title: string;
  description?: string;
  lastDoneAt: string;
  lastMarkedDoneAt?: string;
  cycleInDays: number;
}
