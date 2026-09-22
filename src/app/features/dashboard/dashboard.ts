import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivityService } from '@core/services/activity.service';
import { CategoryService } from '@core/services/category.service';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';
import { Category } from '@core/models/category.model';
import { ActivityGrid } from './components/activity-grid/activity-grid';
import { CategorySidebar } from './components/category-sidebar/category-sidebar';
import { ActivityDialog } from '@shared/components/activity-dialog/activity-dialog';
import { CategoryDialog } from '@shared/components/category-dialog/category-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ActivityGrid,
    CategorySidebar,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  //#region Private variables

  private activityService = inject(ActivityService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private reminderService = inject(ReminderService);

  //#endregion

  //#region Public variables

  categories = this.categoryService.categories;
  activities = this.activityService.activities;

  //#endregion

  //#region Signal variables

  hiddenCategoryIds = signal<Set<number>>(new Set());
  shownEmptyCategoryIds = signal<Set<number>>(new Set());

  //#endregion

  //#region Computed variables

  overdueActivities = computed(() =>
    this.activities().filter(a => this.reminderService.daysUntilDue(a) < 0)
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

  activityCountByCategory = computed(() => {
    const map = new Map<number, number>();
    for (const cat of this.categories()) {
      if (cat.id === undefined) continue;
      map.set(cat.id, this.activities().filter(a => a.categoryId === cat.id).length);
    }
    return map;
  });

  filteredCategories = computed(() => {
    const hidden = this.hiddenCategoryIds();
    const shownEmpty = this.shownEmptyCategoryIds();

    return this.categories().filter(c => {
      if (c.id === undefined) return false;
      const hasActivities = (this.activitiesByCategory().get(c.id)?.length ?? 0) > 0;
      if (hasActivities) return !hidden.has(c.id);
      return shownEmpty.has(c.id);
    });
  });

  //#endregion

  //#region Public methods

  // Toggle filter on Category
  onFilterToggled(categoryId: number): void {
    const hasActivities = (this.activitiesByCategory().get(categoryId)?.length ?? 0) > 0;

    if (hasActivities) {
      this.hiddenCategoryIds.update(set => {
        const next = new Set(set);
        if (next.has(categoryId)) {
          next.delete(categoryId);
        } else {
          next.add(categoryId);
        }
        return next;
      });
    } else {
      this.shownEmptyCategoryIds.update(set => {
        const next = new Set(set);
        if (next.has(categoryId)) {
          next.delete(categoryId);
        } else {
          next.add(categoryId);
        }
        return next;
      });
    }
  }

  // Open dialog and Add Activity
  openAddActivity(): void {
    this.dialog.open(ActivityDialog, { data: {}, width: '480px' });
  }

  // Open dialog and add activity in a specific category
  openAddActivityInCategory(category: Category): void {
    this.dialog.open(ActivityDialog, {
      data: { preselectedCategoryId: category.id },
      width: '480px',
    });
  }

  // Open dialog and Edit Activity
  openEditActivity(activity: Activity): void {
    this.dialog.open(ActivityDialog, { data: { activity }, width: '480px' });
  }

  // Open dialog and Add Category
  openAddCategory(): void {
    this.dialog.open(CategoryDialog, { data: {}, width: '480px' });
  }

  // Open dialog and Edit Category
  openEditCategory(category: Category): void {
    this.dialog.open(CategoryDialog, { data: { category }, width: '480px' });
  }

  // Mark an activity as done with undo snackbar
  async markAsDone(activity: Activity): Promise<void> {
    if (activity.id === undefined) return;

    const previousDate = activity.lastDoneAt;
    const previousMarkedDate = activity.lastMarkedDoneAt;

    await this.activityService.markAsDone(activity.id);

    const snackRef = this.snackBar.open('Activité marquée comme faite', 'Annuler', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    snackRef.onAction().subscribe(async () => {
      await this.activityService.undoMarkAsDone(activity.id!, previousDate, previousMarkedDate);
    });
  }

  //#endregion

  async ngOnInit() {
    await this.activityService.loadAll();
    await this.categoryService.loadAll();
  }
}
