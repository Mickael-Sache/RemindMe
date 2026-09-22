import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReminderBadge } from '@shared/components/reminder-badge/reminder-badge';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, ReminderBadge],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.scss',
})
export class ActivityCard {
  @Input({ required: true }) activity!: Activity;
  @Output() edit = new EventEmitter<Activity>();
  @Output() markDone = new EventEmitter<Activity>();

  reminderService = inject(ReminderService);
}
