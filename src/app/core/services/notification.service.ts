import { Injectable, inject } from '@angular/core';
import { Activity } from '@core/models/activity.model';
import { ReminderService } from './reminder.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private reminderService = inject(ReminderService);

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  notifyOverdue(activities: Activity[]): void {
    if (Notification.permission !== 'granted') return;
    const overdue = activities.filter(a => this.reminderService.daysUntilDue(a) < 0);
    if (overdue.length === 0) return;

    new Notification(`⏰ RemindMe — ${overdue.length} rappel(s) en retard`, {
      body: overdue.map(a => `${a.title}`).join('\n'),
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'remindme-overdue',
    });
  }
}
