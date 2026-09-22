import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivityDialog } from './activity-dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('ActivityDialog', () => {
  let component: ActivityDialog;
  let fixture: ComponentFixture<ActivityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDialog],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
