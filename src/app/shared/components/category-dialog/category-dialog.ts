import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/category.model';
import { DialogRef } from '@angular/cdk/dialog';

export const ICON_OPTIONS = [
  'directions_car',
  'home',
  'restaurant',
  'medical_services',
  'sports_soccer',
  'cleaning_services',
  'local_laundry_service',
  'pets',
];
export const COLOR_OPTIONS = [
  '#E53935',
  '#8E24AA',
  '#1E88E5',
  '#00897B',
  '#43A047',
  '#FB8C00',
  '#6D4C41',
  '#546E7A',
];

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './category-dialog.html',
  styleUrl: './category-dialog.scss',
})
export class CategoryDialog {
  private formBuilder = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private dialogRef = inject(DialogRef);
  data: { category?: Category } = inject(MAT_DIALOG_DATA);

  iconOptions = ICON_OPTIONS;
  colorOptions = COLOR_OPTIONS;

  form = this.formBuilder.group({
    name: [this.data.category?.name ?? '', [Validators.required, Validators.maxLength(30)]],
    icon: [this.data.category?.icon ?? 'home'],
    color: [this.data.category?.color ?? '#1E88E5'],
  });

  async save() {
    if (this.form.invalid) return;
    const { name, icon, color } = this.form.value as Category;

    if (this.data.category) {
      await this.categoryService.update(this.data.category.id!, { name, icon, color });
    } else {
      await this.categoryService.add({ name, icon, color });
    }

    this.dialogRef.close(true);
  }
}
