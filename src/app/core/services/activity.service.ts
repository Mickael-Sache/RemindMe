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

  // CRUD - Delete
  async delete(id: number): Promise<void> {
    await remindmeDB.activities.delete(id);
    this.activities.update(list => list.filter(a => a.id !== id));
  }

  // Update Activity status
  async markAsDone(id: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await remindmeDB.activities.update(id, { lastDoneAt: today });
    this.activities.update(list => list.map(a => (a.id === id ? { ...a, lastDoneAt: today } : a)));
  }

  // Filter by Category
  getByCategory(categoryId: number): Activity[] {
    return this.activities().filter(a => a.categoryId === categoryId);
  }
}
