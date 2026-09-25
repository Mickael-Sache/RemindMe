import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calendar } from './calendar';
import { ActivityService } from '@core/services/activity.service';
import { CategoryService } from '@core/services/category.service';
import { Activity } from '@core/models/activity.model';
import { Category } from '@core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { ActivityDialog } from '@shared/components/activity-dialog/activity-dialog';

function makeActivity(overrides: Partial<Activity>): Activity {
  return {
    id: 1,
    categoryId: 1,
    title: 'Test activity',
    lastDoneAt: new Date().toISOString().split('T')[0],
    cycleInDays: 7,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category>): Category {
  return {
    id: 1,
    name: 'Jardin',
    icon: 'yard',
    color: '#4caf50',
    ...overrides,
  };
}

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;
  let activityService: ActivityService;
  let categoryService: CategoryService;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;
  let dialogOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snackBarOpenSpy = vi.fn().mockReturnValue({
      onAction: () => ({
        subscribe: () => {
          /* no-op for test */
        },
      }),
    });
    dialogOpenSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [
        provideNativeDateAdapter(),
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    activityService = TestBed.inject(ActivityService);
    categoryService = TestBed.inject(CategoryService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks a date with a due activity with its category color class', () => {
    categoryService.categories.set([makeCategory({ id: 1, color: '#4caf50' })]);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    activityService.activities.set([
      makeActivity({
        id: 1,
        categoryId: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 5,
      }),
    ]);

    const result = component.dateClass(dueDate, 'month');
    expect(result).toBe('cal-colors-4caf50');
  });

  it('combines two categories due the same day into a single deterministic class', () => {
    categoryService.categories.set([
      makeCategory({ id: 1, color: '#4caf50' }),
      makeCategory({ id: 2, color: '#2196f3' }),
    ]);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    activityService.activities.set([
      makeActivity({
        id: 1,
        categoryId: 2,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 5,
      }),
      makeActivity({
        id: 2,
        categoryId: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 5,
      }),
    ]);

    const result = component.dateClass(dueDate, 'month');
    expect(result).toBe('cal-colors-2196f3-4caf50');
  });

  it('generates a stylesheet rule for every combo class returned by dateClass', () => {
    categoryService.categories.set([makeCategory({ id: 1, color: '#4caf50' })]);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    activityService.activities.set([
      makeActivity({
        id: 1,
        categoryId: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 5,
      }),
    ]);

    const className = component.dateClass(dueDate, 'month');
    expect(component.categoryStylesheet()).toContain(`.${className}`);
  });

  it('marks today as calendar-day--overdue when an activity is overdue', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: oldDate.toISOString().split('T')[0], cycleInDays: 1 }),
    ]);

    const result = component.dateClass(new Date(), 'month');
    expect(result).toContain('calendar-day--overdue');
  });

  it('returns an empty class for a date without activity', () => {
    activityService.activities.set([]);
    const result = component.dateClass(new Date(), 'month');
    expect(result).toBe('');
  });

  it('updates selectedDate on selection change', () => {
    const newDate = new Date(2026, 0, 15);
    component.onSelectedChange(newDate);
    expect(component.selectedDate()).toBe(newDate);
  });

  it('includes due-today and overdue activities in todayActivities', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: oldDate.toISOString().split('T')[0], cycleInDays: 1 }),
      makeActivity({
        id: 2,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 0,
      }),
    ]);

    expect(component.todayActivities().length).toBeGreaterThanOrEqual(1);
  });

  it('includes activities due within 7 days and sorts them by proximity, excluding today', () => {
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: new Date().toISOString().split('T')[0], cycleInDays: 6 }),
      makeActivity({ id: 2, lastDoneAt: new Date().toISOString().split('T')[0], cycleInDays: 3 }),
      makeActivity({ id: 3, lastDoneAt: new Date().toISOString().split('T')[0], cycleInDays: 0 }),
      makeActivity({ id: 4, lastDoneAt: new Date().toISOString().split('T')[0], cycleInDays: 10 }),
    ]);

    const result = component.upcomingActivities();
    expect(result.map(a => a.id)).toEqual([2, 1]);
  });

  it('marks an activity as done and opens an undo snackbar', async () => {
    const activity = makeActivity({ id: 1 });
    activityService.activities.set([activity]);
    vi.spyOn(activityService, 'markAsDone').mockResolvedValue();

    await component.markAsDone(activity);

    expect(activityService.markAsDone).toHaveBeenCalledWith(1);
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Activité marquée comme faite',
      'Annuler',
      expect.any(Object)
    );
  });

  it('updates todayActivities when selectedDate changes to a day with a due activity', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    activityService.activities.set([
      makeActivity({
        id: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 5,
      }),
    ]);

    expect(component.todayActivities().map(a => a.id)).not.toContain(1);

    component.onSelectedChange(dueDate);

    expect(component.todayActivities().map(a => a.id)).toContain(1);
  });

  it('opens ActivityDialog with the activity data when opening activity details', () => {
    const activity = makeActivity({ id: 1 });

    component.openActivityDetails(activity);

    expect(dialogOpenSpy).toHaveBeenCalledWith(ActivityDialog, {
      data: { activity },
      width: '480px',
    });
  });

  // A selected day in future must not display overdue activities
  it('excludes overdue activities from todayActivities when a future day is selected', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: oldDate.toISOString().split('T')[0], cycleInDays: 4 }),
    ]);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    component.onSelectedChange(futureDate);

    expect(component.todayActivities().map(a => a.id)).not.toContain(1);
  });

  // Explicit selection from current day with overdue activities are must shown (non-regression)
  it('includes overdue activities in todayActivities when today is explicitly selected', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: oldDate.toISOString().split('T')[0], cycleInDays: 1 }),
    ]);

    component.onSelectedChange(new Date());

    expect(component.todayActivities().map(a => a.id)).toContain(1);
  });

  // Current day with no activities must display an empty list
  it('returns an empty list for a past day with no activity due that exact day', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    activityService.activities.set([
      makeActivity({ id: 1, lastDoneAt: oldDate.toISOString().split('T')[0], cycleInDays: 4 }),
    ]);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    component.onSelectedChange(pastDate);

    expect(component.todayActivities()).toEqual([]);
  });

  // Event projection from multiple occurence (cycle of 2 days : J+2, J+4)
  it('colors every recurring occurrence of an activity, not just the first one', () => {
    categoryService.categories.set([makeCategory({ id: 1, color: '#4caf50' })]);
    activityService.activities.set([
      makeActivity({
        id: 1,
        categoryId: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 2,
      }),
    ]);

    const dayPlus2 = new Date();
    dayPlus2.setDate(dayPlus2.getDate() + 2);
    const dayPlus4 = new Date();
    dayPlus4.setDate(dayPlus4.getDate() + 4);
    const dayPlus1 = new Date();
    dayPlus1.setDate(dayPlus1.getDate() + 1);

    expect(component.dateClass(dayPlus2, 'month')).toBe('cal-colors-4caf50');
    expect(component.dateClass(dayPlus4, 'month')).toBe('cal-colors-4caf50');
    expect(component.dateClass(dayPlus1, 'month')).toBe('');
  });

  // Combo multiple categories with recurrent event (not only next one)
  it('combines categories that align on a later projected occurrence, not just k=1', () => {
    categoryService.categories.set([
      makeCategory({ id: 1, color: '#4caf50' }),
      makeCategory({ id: 2, color: '#2196f3' }),
    ]);
    activityService.activities.set([
      makeActivity({
        id: 1,
        categoryId: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 4,
      }),
      makeActivity({
        id: 2,
        categoryId: 2,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 8,
      }),
    ]);

    const dayPlus8 = new Date();
    dayPlus8.setDate(dayPlus8.getDate() + 8);

    const className = component.dateClass(dayPlus8, 'month');
    expect(className).toBe('cal-colors-2196f3-4caf50');
    expect(component.categoryStylesheet()).toContain(`.${className}`);
  });

  // Guard for invalid number cycle
  it('does not throw and skips activities with a non-positive cycle', () => {
    activityService.activities.set([makeActivity({ id: 1, cycleInDays: 0 })]);

    expect(() => component.dateClass(new Date(), 'month')).not.toThrow();
  });

  // Show activities in TodayActivities for each recurrence
  it('shows the activity in todayActivities when a later projected occurrence is selected', () => {
    activityService.activities.set([
      makeActivity({
        id: 1,
        lastDoneAt: new Date().toISOString().split('T')[0],
        cycleInDays: 2,
      }),
    ]);

    const dayPlus4 = new Date(); // 2e occurrence projetée (k=2)
    dayPlus4.setDate(dayPlus4.getDate() + 4);
    component.onSelectedChange(dayPlus4);

    expect(component.todayActivities().map(a => a.id)).toContain(1);
  });
});
