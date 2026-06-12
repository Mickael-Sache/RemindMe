import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDialog } from './activity-dialog';

describe('ActivityDialog', () => {
  let component: ActivityDialog;
  let fixture: ComponentFixture<ActivityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
