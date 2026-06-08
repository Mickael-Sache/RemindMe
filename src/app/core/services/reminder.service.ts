import { Injectable } from '@angular/core';
import { Activity } from '@core/models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  // Date to trigger notification for activity based on cycleInDays
  nextDueAt(activity: Activity): Date {
    const last = new Date(activity.lastDoneAt);
    last.setDate(last.getDate() + activity.cycleInDays);
    return last;
  }

  // Number of days until next due date
  daysUntilDue(activity: Activity): number {
    const today = new Date();
    const dueDate = this.nextDueAt(activity);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Is current activity is overdue
  isOverdue(activity: Activity): boolean {
    return this.daysUntilDue(activity) < 0;
  }
}
