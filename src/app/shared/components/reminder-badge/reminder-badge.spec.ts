import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderBadge } from './reminder-badge';

describe('ReminderBadge', () => {
  let component: ReminderBadge;
  let fixture: ComponentFixture<ReminderBadge>;
  const mockActivity = {
    id: 1,
    title: 'Test',
    lastDoneAt: new Date().toISOString(),
    cycleInDays: 7,
    categoryId: 1,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReminderBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderBadge);
    component = fixture.componentInstance;
    fixture.componentInstance.activity = mockActivity;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
