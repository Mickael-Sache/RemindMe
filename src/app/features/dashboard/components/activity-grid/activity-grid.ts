import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivityCard } from '@shared/components/activity-card/activity-card';
import { CategoryBadge } from '@shared/components/category-badge/category-badge';
import { Activity } from '@core/models/activity.model';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, ActivityCard, CategoryBadge],
  templateUrl: './activity-grid.html',
  styleUrl: './activity-grid.scss',
})
export class ActivityGrid {
  @Input({ required: true }) categories!: Category[];
  @Input({ required: true }) activitiesByCategory!: Map<number, Activity[]>;
  @Input({ required: true }) activityCountByCategory!: Map<number, number>;

  @Output() editCategory = new EventEmitter<Category>();
  @Output() addActivity = new EventEmitter<Category>();
  @Output() editActivity = new EventEmitter<Activity>();
  @Output() markActivityDone = new EventEmitter<Activity>();
}
