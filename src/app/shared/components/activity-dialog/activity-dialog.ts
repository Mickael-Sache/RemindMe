import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from '@core/services/activity.service';
import { CategoryService } from '@core/services/category.service';
import { Activity } from '@core/models/activity.model';

// Cycle Options for recurrent activities
export const CYCLE_OPTIONS = [
  { label: 'Chaque jour', value: 1 },
  { label: 'Tous les 2 jours', value: 2 },
  { label: 'Tous les 3 jours', value: 3 },
  { label: 'Chaque semaine', value: 7 },
  { label: 'Toutes les 2 sem.', value: 14 },
  { label: 'Chaque mois', value: 30 },
  { label: 'Tous les 3 mois', value: 90 },
];

@Component({
  selector: 'app-activity-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './activity-dialog.html',
  styleUrl: './activity-dialog.scss',
})
export class ActivityDialog {
  private formBuilder = inject(FormBuilder);
  private activityService = inject(ActivityService);
  categoryService = inject(CategoryService);
  private dialogRef = inject(MatDialogRef<ActivityDialog>);

  cycleOptions = CYCLE_OPTIONS;

  data: { activity?: Activity; preselectedCategoryId?: number } = inject(MAT_DIALOG_DATA);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(30)]],
    description: [''],
    categoryId: [
      this.data.activity?.categoryId ?? this.data.preselectedCategoryId ?? null,
      Validators.required,
    ],
    lastDoneAt: [
      this.data.activity?.lastDoneAt
        ? new Date(this.data.activity.lastDoneAt)
        : (() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
          })(),
    ],
    cycleInDays: [this.data.activity?.cycleInDays ?? 7, Validators.required],
  });

  async save() {
    if (this.form.invalid) return;
    const value = this.form.value;

    const payload: Omit<Activity, 'id'> = {
      title: value.title!,
      description: value.description ?? '',
      categoryId: value.categoryId!,
      lastDoneAt: (value.lastDoneAt as Date).toISOString(),
      cycleInDays: value.cycleInDays!,
    };

    if (this.data.activity) {
      await this.activityService.update(this.data.activity.id!, payload);
    } else {
      await this.activityService.add(payload);
    }
    this.dialogRef.close(true);
  }
}
