import { Injectable, signal, computed, inject } from '@angular/core';
import { remindmeDB } from '@core/db/app-db';
import { Activity } from '@core/models/activity.model';
import { ReminderService } from './reminder.service';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private reminderService = inject(ReminderService);

  // Reactive signal
  activities = signal<Activity[]>([]);

  // Recalculated on changes on Activity -- Overdue time for Activity
  overdueCount = computed(
    () => this.activities().filter(a => this.reminderService.daysUntilDue(a) < 0).length
  );

  // Near overdue for Activity
  urgentCount = computed(
    () => this.activities().filter(a => this.reminderService.daysUntilDue(a) <= 3).length
  );

  // CRUD - Read
  async loadAll(): Promise<void> {
    const data = await remindmeDB.activities.toArray();
    this.activities.set(data);
  }

  // CRUD - Add
  async add(activity: Omit<Activity, 'id'>): Promise<void> {
    const newId = await remindmeDB.activities.add(activity);
    const newActivity = { ...activity, id: newId };
    this.activities.update(list => [...list, newActivity]);
  }

  // CRUD - Update
  async update(id: number, changes: Partial<Activity>): Promise<void> {
    await remindmeDB.activities.update(id, changes);
    this.activities.update(list => list.map(a => (a.id === id ? { ...a, ...changes } : a)));
  }

  // CRUD - Delete
  async delete(id: number): Promise<void> {
    await remindmeDB.activities.delete(id);
    this.activities.update(list => list.filter(a => a.id !== id));
  }

  // Mark as done Activity status
  async markAsDone(id: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await remindmeDB.activities.update(id, {
      lastDoneAt: today,
      lastMarkedDoneAt: today, // ← les deux sont mis à jour ensemble
    });
    this.activities.update(list =>
      list.map(a => (a.id === id ? { ...a, lastDoneAt: today, lastMarkedDoneAt: today } : a))
    );
  }

  // Undo mark as done Activity status
  async undoMarkAsDone(
    id: number,
    previousDate: string,
    previousMarkedDate: string | undefined
  ): Promise<void> {
    await remindmeDB.activities.update(id, {
      lastDoneAt: previousDate,
      lastMarkedDoneAt: previousMarkedDate,
    });
    this.activities.update(list =>
      list.map(a =>
        a.id === id ? { ...a, lastDoneAt: previousDate, lastMarkedDoneAt: previousMarkedDate } : a
      )
    );
  }

  // Filter by Category
  getByCategory(categoryId: number): Activity[] {
    return this.activities().filter(a => a.categoryId === categoryId);
  }

  // Filter overdue activities for a specific date (for calendar)
  getOverdueForDate(date: Date): Activity[] {
    return this.activities().filter(a => {
      const nextDue = this.reminderService.nextDueAt(a);
      return nextDue < this.startOfDay(date);
    });
  }

  // Filter upcoming activities for a specific date (for calendar)
  getUpcomingForDate(date: Date): Activity[] {
    return this.activities().filter(a => {
      const nextDue = this.reminderService.nextDueAt(a);
      return this.isSameDay(nextDue, date);
    });
  }

  // Set start of a day
  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Check for same day
  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
