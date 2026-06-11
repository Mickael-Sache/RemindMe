import { Component, Input, inject } from '@angular/core';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';
import { NgClass } from '../../../../../node_modules/@angular/common/types/_common_module-chunk';

@Component({
  selector: 'app-reminder-badge',
  standalone: true,
  template: `
    <span class="badge" [ngClass]="badgeClass">{{ label }}</span>
  `,
  imports: [NgClass],
  //imports: [],
  //templateUrl: './reminder-badge.html',
  //styleUrl: './reminder-badge.scss',
})
export class ReminderBadge {
  @Input({ required: true }) activity!: Activity;
  private reminderService = inject(ReminderService);

  get daysLeft(): number {
    return this.reminderService.daysUntilDue(this.activity);
  }

  get label(): string {
    if (this.daysLeft < 0) return `En retard (${Math.abs(this.daysLeft)}j)`;
    if (this.daysLeft === 0) return "Aujourd'hui";
    if (this.daysLeft === 1) return 'Demain';

    return `Dans ${this.daysLeft}j`;
  }

  get badgeClass(): string {
    if (this.daysLeft < 0) return 'badge-overdue';
    if (this.daysLeft <= 1) return 'badge-urgent';
    if (this.daysLeft <= 7) return 'badge-soon';
    return 'badge-ok';
  }
}
