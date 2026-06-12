import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';

@Component({
  selector: 'app-reminder-badge',
  standalone: true,
  template: `
    <span class="badge" [style.color]="'var(--text-disabled)'" [style.font-size]="'0.8rem'">
      <mat-icon [style.color]="badgeColor">circle</mat-icon>
      {{ label }}
    </span>
  `,
  imports: [MatIconModule],
})
export class ReminderBadge {
  @Input({ required: true }) activity!: Activity;
  private reminderService = inject(ReminderService);

  // Get number of days remaining for an activity
  get daysLeft(): number {
    return this.reminderService.daysUntilDue(this.activity);
  }

  // Get associated label for remaining time for an activity
  get label(): string {
    if (this.daysLeft < 0) return `En retard de (${Math.abs(this.daysLeft)} j)`;
    if (this.daysLeft === 0) return "Aujourd'hui";
    if (this.daysLeft === 1) return 'Demain';

    return `Dans ${this.daysLeft} jours`;
  }

  // Get badge color for each case of daysleft
  get badgeColor(): string {
    if (this.daysLeft < 0) return 'var(--status-overdue)';
    if (this.daysLeft <= 1) return 'var(--status-soon)';
    if (this.daysLeft <= 7) return 'var(--status-ok)';
    return 'var(--status-ok)';
  }
}
