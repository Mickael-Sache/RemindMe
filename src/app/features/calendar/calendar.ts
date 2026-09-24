import { Component, OnInit, computed, inject, signal, ViewChild, effect } from '@angular/core';
import {
  MatDatepickerModule,
  MatCalendarCellClassFunction,
  MatCalendar,
} from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '@core/services/activity.service';
import { ReminderService } from '@core/services/reminder.service';
import { CategoryService } from '@core/services/category.service';
import { Activity } from '@core/models/activity.model';
import { DayActivitiesPanel } from './components/day-activities-panel/day-activities-panel';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MatDatepickerModule, DayActivitiesPanel],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  //#region Private variables

  private activityService = inject(ActivityService);
  private reminderService = inject(ReminderService);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);

  @ViewChild(MatCalendar) private matCalendar?: MatCalendar<Date>;

  //#endregion

  //#region Public variables

  activities = this.activityService.activities;
  categoryService = inject(CategoryService);
  categories = this.categoryService.categories;

  //#endregion

  //#region Signal variables

  selectedDate = signal<Date>(new Date());

  //#endregion

  //#region Computed variables

  categoriesById = computed(() => new Map(this.categories().map(c => [c.id!, c])));

  // Map<'YYYY-MM-DD', Set<categoryId>> built once per activities() change
  dayCategoryMap = computed(() => {
    const map = new Map<string, Set<number>>();

    for (const activity of this.activities()) {
      const key = this.toKey(this.reminderService.nextDueAt(activity));
      const set = map.get(key) ?? new Set<number>();
      set.add(activity.categoryId);
      map.set(key, set);
    }

    return map;
  });

  // CSS generated once per activities()/categories() change, injected via <style> in the template
  categoryStylesheet = computed(() => {
    const combos = new Map<string, string[]>();

    for (const ids of this.dayCategoryMap().values()) {
      const combo = this.comboClassFor(ids);
      if (combo) combos.set(combo.className, combo.hexes);
    }

    let css = '';
    for (const [className, hexes] of combos) {
      const stops = hexes
        .map((hex, i) => {
          const start = (i / hexes.length) * 100;
          const end = ((i + 1) / hexes.length) * 100;
          return `${hex} ${start}%, ${hex} ${end}%`;
        })
        .join(', ');

      css += `.mat-calendar-body-cell-container:has(> .mat-calendar-body-cell.${className})::after { content: ''; position: absolute; left: 10%; right: 10%; bottom: 6%; height: 3px; border-radius: 2px; background: linear-gradient(to right, ${stops}); z-index: 3; }\n`;
    }

    return css;
  });

  styleTag = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(`<style>${this.categoryStylesheet()}</style>`)
  );

  hasOverdue = computed(() => this.activities().some(a => this.reminderService.isOverdue(a)));

  // Activities shown in the "Aujourd'hui" section of the side panel
  todayActivities = computed(() => {
    const today = new Date();
    return [
      ...this.activityService.getUpcomingForDate(today),
      ...this.activityService.getOverdueForDate(today),
    ];
  });

  // Activities shown in the "À venir" section of the side panel (next 7 days, same window as Dashboard)
  upcomingActivities = computed(() =>
    this.activities()
      .filter(a => {
        const days = this.reminderService.daysUntilDue(a);
        return days >= 1 && days <= 7;
      })
      .sort((a, b) => this.reminderService.daysUntilDue(a) - this.reminderService.daysUntilDue(b))
  );

  //#endregion

  constructor() {
    effect(() => {
      this.dayCategoryMap();
      this.hasOverdue();
      this.matCalendar?.updateTodaysDate();
    });
  }

  //#region Public methods

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view !== 'month') return '';

    const classes: string[] = [];

    if (this.isToday(cellDate) && this.hasOverdue()) {
      classes.push('calendar-day--overdue');
    }

    const combo = this.comboClassFor(this.dayCategoryMap().get(this.toKey(cellDate)));
    if (combo) classes.push(combo.className);

    return classes.join(' ');
  };

  onSelectedChange(date: Date | null): void {
    if (date) this.selectedDate.set(date);
  }

  // Mark an activity as done with undo snackbar (same pattern as Dashboard)
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

  //#region Private methods

  // Single source of truth for the class name shared between dateClass and categoryStylesheet
  private comboClassFor(
    ids: Set<number> | undefined
  ): { className: string; hexes: string[] } | null {
    if (!ids || ids.size === 0) return null;

    const hexes = [...ids]
      .map(id => this.categoriesById().get(id)?.color)
      .filter((c): c is string => !!c)
      .sort();

    if (hexes.length === 0) return null;

    const className = `cal-colors-${hexes.map(h => this.sanitizeColor(h)).join('-')}`;

    return { className, hexes };
  }

  private sanitizeColor(color: string): string {
    return color.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  private toKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isToday(date: Date): boolean {
    return this.toKey(date) === this.toKey(new Date());
  }

  //#endregion

  async ngOnInit(): Promise<void> {
    await this.activityService.loadAll();
    await this.categoryService.loadAll();
  }
}
