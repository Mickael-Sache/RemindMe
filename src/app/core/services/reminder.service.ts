import { Injectable } from '@angular/core';
import { Activity } from '@core/models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  // Date to trigger notification for activity based on cycleInDays
  nextDueAt(activity: Activity): Date {
    const last = new Date(activity.lastDoneAt);
    // Normalize to midnight in local time to avoid misbehaviour
    const normalized = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    normalized.setDate(normalized.getDate() + activity.cycleInDays);
    return normalized;
  }

  // Number of days until next due date
  daysUntilDue(activity: Activity): number {
    const today = new Date();
    const dueDate = this.nextDueAt(activity);
    // Initialize hours of an activity to midnight
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Is current activity is overdue
  isOverdue(activity: Activity): boolean {
    return this.daysUntilDue(activity) < 0;
  }

  isDoneToday(activity: Activity): boolean {
    if (!activity.lastMarkedDoneAt) return false;
    const today = new Date();
    const last = new Date(activity.lastMarkedDoneAt as string); // ← assertion de type
    return (
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate()
    );
  }

  // Return formated label for every possible cycle in days
  getCycleLabel(activity: Activity): string {
    switch (activity.cycleInDays) {
      case 1:
        return '↻ Chaque jour';
      case 2:
        return '↻ Tous les 2 jours';
      case 3:
        return '↻ Tous les 3 jours';
      case 7:
        return '↻ Chaque semaine';
      case 14:
        return '↻ Toutes les 2 semaines';
      case 30:
        return '↻ Chaque mois';
      case 90:
        return '↻ Tous les 3 mois';
      default:
        return `↻ Tous les ${activity.cycleInDays} jours`;
    }
  }
}
