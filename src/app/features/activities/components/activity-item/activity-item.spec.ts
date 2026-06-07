import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityItem } from './activity-item';

describe('ActivityItem', () => {
  let component: ActivityItem;
  let fixture: ComponentFixture<ActivityItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
