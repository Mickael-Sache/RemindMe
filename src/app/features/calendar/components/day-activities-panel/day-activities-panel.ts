import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivityCard } from '@shared/components/activity-card/activity-card';
import { Activity } from '@core/models/activity.model';

@Component({
  selector: 'app-day-activities-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, ActivityCard],
  templateUrl: './day-activities-panel.html',
  styleUrl: './day-activities-panel.scss',
})
export class DayActivitiesPanel {
  @Input({ required: true }) todayActivities!: Activity[];
  @Input({ required: true }) upcomingActivities!: Activity[];
  @Input() todayLabel: Date = new Date();
  @Output() markDone = new EventEmitter<Activity>();
}
