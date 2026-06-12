import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivityService } from '@core/services/activity.service';
import { CategoryService } from '@core/services/category.service';
import { NotificationService } from '@core/services/notification.service';
import { ReminderService } from '@core/services/reminder.service';
import { Activity } from '@core/models/activity.model';
import { Category } from '@core/models/category.model';
import { ReminderBadge } from '@shared/components/reminder-badge/reminder-badge';
import { ActivityDialog } from '@shared/components/activity-dialog/activity-dialog';
import { CategoryDialog } from '@shared/components/category-dialog/category-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconButton,
    MatIconModule,
    MatBadgeModule,
    ReminderBadge,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  //#region Private variables

  private activityService = inject(ActivityService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  //#endregion

  //#region Public variables

  reminderService = inject(ReminderService);
  categories = this.categoryService.categories;
  activities = this.activityService.activities;

  //#endregion

  //#region Signal variables
  isDragMode = signal<boolean>(false);
  hiddenCategoryIds = signal<Set<number>>(new Set());
  shownEmptyCategoryIds = signal<Set<number>>(new Set());
  //#endregion

  //#region Computed variables

  // Get activities overdue (days < 0)
  overdueActivities = computed(() =>
    this.activities().filter(a => this.reminderService.daysUntilDue(a) < 0)
  );

  // Get activities to realize as today (days === 0)
  dueTodayActivities = computed(() =>
    this.activities().filter(a => this.reminderService.daysUntilDue(a) === 0)
  );

  // Get activities scheduled this week (days >= 1 & days <= 7)
  dueThisWeekActivities = computed(() =>
    this.activities().filter(a => {
      const days = this.reminderService.daysUntilDue(a);
      return days >= 1 && days <= 7;
    })
  );

  // Get activities by category
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

  // Count activity by Category
  activityCountByCategory = computed(() => {
    const map = new Map<number, number>();
    for (const cat of this.categories()) {
      if (cat.id === undefined) continue;
      map.set(cat.id, this.activities().filter(a => a.categoryId === cat.id).length);
    }
    return map;
  });

  // Filter Category with atleast one activities
  categoriesWithActivities = computed(() =>
    this.categories().filter(
      c => c.id !== undefined && (this.activitiesByCategory().get(c.id)?.length ?? 0) > 0
    )
  );

  // Filter Category by selection
  filteredCategories = computed(() => {
    const hidden = this.hiddenCategoryIds();
    const shownEmpty = this.shownEmptyCategoryIds();

    return this.categories().filter(c => {
      if (c.id === undefined) return false;
      const hasActivities = (this.activitiesByCategory().get(c.id)?.length ?? 0) > 0;

      if (hasActivities) return !hidden.has(c.id); // Showed only if not hidden
      return shownEmpty.has(c.id); // Showed only if selected
    });
  });

  //#endregion

  //#region Public methods

  // Toggle drag mode for ordering category
  toggleDragMode(): void {
    this.isDragMode.set(!this.isDragMode());
  }

  // MoveUp Category
  async moveCategoryUp(index: number): Promise<void> {
    if (index === 0) return;
    const reordered = [...this.categories()];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    this.categoryService.categories.set([...reordered]);
    await this.categoryService.reorder(reordered.filter(c => c.id !== undefined).map(c => c.id!));
  }

  // ModeDown Category
  async moveCategoryDown(index: number): Promise<void> {
    if (index === this.categories().length - 1) return;
    const reordered = [...this.categories()];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    this.categoryService.categories.set([...reordered]);
    await this.categoryService.reorder(reordered.filter(c => c.id !== undefined).map(c => c.id!));
  }

  // Toggle filter on Category
  toggleCategoryFilter(categoryId: number): void {
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

  // Check if Category is visible
  isCategoryVisible(categoryId: number): boolean {
    const hasActivities = (this.activitiesByCategory().get(categoryId)?.length ?? 0) > 0;
    if (hasActivities) return !this.hiddenCategoryIds().has(categoryId);
    return this.shownEmptyCategoryIds().has(categoryId);
  }

  // Get Cycle in days per Activity
  getActivityCycleDays(activity: Activity): string {
    return this.reminderService.getCycleLabel(activity);
  }

  // Get class associated with number of remaining days for an activities
  getActivityClass(activity: Activity): string {
    const days = this.reminderService.daysUntilDue(activity);
    if (days < 0) return 'activity-overdue';
    if (days <= 2) return 'activity-urgent';
    return '';
  }

  // Open dialog and Add Activity
  openAddActivity(): void {
    this.dialog.open(ActivityDialog, {
      data: {},
      width: '480px',
    });
  }

  // Open dialog and add activity directly in category's card
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

  // Mark an activity as done
  async markAsDone(activity: Activity): Promise<void> {
    if (activity.id === undefined) return;

    const previousDate = activity.lastDoneAt;
    const previousMarkedDate = activity.lastMarkedDoneAt; // ← capturer avant modification

    // Mark current activity as done
    await this.activityService.markAsDone(activity.id);

    const snackRef = this.snackBar.open('Activité marquée comme faite', 'Annuler', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    // Undo validation as done
    snackRef.onAction().subscribe(async () => {
      await this.activityService.undoMarkAsDone(activity.id!, previousDate, previousMarkedDate);
    });
  }

  //#endregion

  async ngOnInit() {
    // Wait for Activity to load
    await this.activityService.loadAll();
    // Wait for Category to load
    await this.categoryService.loadAll();
  }
}
