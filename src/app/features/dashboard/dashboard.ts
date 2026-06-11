import { Component, inject, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule, MatIconButton, MatFabButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { ActivityService } from '@core/services/activity.service';
import { CategoryService } from '@core/services/category.service';
import { NotificationService } from '@core/services/notification.service';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';
import { NgClass } from '../../../../node_modules/@angular/common/types/_common_module-chunk';
import { ReminderBadge } from '@shared/components/reminder-badge/reminder-badge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconButton,
    MatFabButton,
    MatIconModule,
    MatBadgeModule,
    NgClass,
    ReminderBadge,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private activityService = inject(ActivityService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private reminderService = inject(ReminderService);
  private dialog = inject(MatDialog);

  categories = this.categoryService.categories;
  activities = this.activityService.activities;

  overdueActivities = computed(() =>
    this.activities().filter(a => this.reminderService.daysUntilDue(a) > 0)
  );

  dueTodayActivities = computed(() =>
    this.activities().filter(a => this.reminderService.daysUntilDue(a) === 0)
  );

  dueThisWeekActivities = computed(() =>
    this.activities().filter(a => {
      const days = this.reminderService.daysUntilDue(a);
      return days >= 1 && days <= 7;
    })
  );

  activitiesByCategory = computed(() => {
    const map = new Map<number, Activity[]>();
    for (const cat of this.categories()) {
      if (cat.id === undefined) continue;
      map.set(
        cat.id,
        this.activities().filter(a => a.categoryId === cat.id)
      );
    }
    return map;
  });

  getActivityClass(activity: Activity): string {
    const days = this.reminderService.daysUntilDue(activity);
    if (days < 0) return 'activity-overdue';
    if (days <= 2) return 'activity-urgent';
    return '';
  }

  openAddActivity(): void {
    this.dialog.open(ActivityDialog, {
      data: {},
      width: '480px',
    });
  }

  async markAsDone(activity: Activity): Promise<void> {
    if (activity.id === undefined) return;
    await this.activityService.markAsDone(activity.id);
  }

  async ngOnInit() {
    await this.activityService.loadAll();
    await this.categoryService.loadAll();
  }
}
