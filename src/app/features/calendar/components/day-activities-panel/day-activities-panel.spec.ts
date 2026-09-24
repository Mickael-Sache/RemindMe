import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DayActivitiesPanel } from './day-activities-panel';
import { ActivityCard } from '@shared/components/activity-card/activity-card';
import { Activity } from '@core/models/activity.model';

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

describe('DayActivitiesPanel', () => {
  let component: DayActivitiesPanel;
  let fixture: ComponentFixture<DayActivitiesPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayActivitiesPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(DayActivitiesPanel);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.todayActivities = [];
    component.upcomingActivities = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders both section headers', () => {
    component.todayLabel = new Date(2026, 5, 12);
    component.todayActivities = [];
    component.upcomingActivities = [];
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('h3'));
    expect(headers.length).toBe(2);
    expect(headers[1].nativeElement.textContent).toContain('À venir');
  });

  it('renders one activity-card per activity across both sections', () => {
    component.todayActivities = [makeActivity({ id: 1 })];
    component.upcomingActivities = [makeActivity({ id: 2 }), makeActivity({ id: 3 })];
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(ActivityCard));
    expect(cards.length).toBe(3);
  });

  it('emits markDone when an ActivityCard emits markDone', () => {
    const activity = makeActivity({ id: 1 });
    component.todayActivities = [activity];
    component.upcomingActivities = [];
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.markDone, 'emit');
    const card = fixture.debugElement.query(By.directive(ActivityCard))
      .componentInstance as ActivityCard;
    card.markDone.emit(activity);

    expect(emitSpy).toHaveBeenCalledWith(activity);
  });

  it('shows independent empty-state text per section', () => {
    component.todayActivities = [];
    component.upcomingActivities = [];
    fixture.detectChanges();

    const emptyStates = fixture.debugElement.queryAll(By.css('.empty-state'));
    expect(emptyStates.length).toBe(2);
    expect(emptyStates[0].nativeElement.textContent).toContain("Aucune activité aujourd'hui");
    expect(emptyStates[1].nativeElement.textContent).toContain('Rien de prévu cette semaine');
  });
});
