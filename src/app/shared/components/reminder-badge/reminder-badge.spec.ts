import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderBadge } from './reminder-badge';

describe('ReminderBadge', () => {
  let component: ReminderBadge;
  let fixture: ComponentFixture<ReminderBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReminderBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
