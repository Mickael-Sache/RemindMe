import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './category-sidebar.html',
  styleUrl: './category-sidebar.scss',
})
export class CategorySidebar {
  @Input({ required: true }) categories!: Category[];
  @Input({ required: true }) activityCountByCategory!: Map<number, number>;
  @Input({ required: true }) hiddenCategoryIds!: Set<number>;
  @Input({ required: true }) shownEmptyCategoryIds!: Set<number>;

  @Output() filterToggled = new EventEmitter<number>();
  @Output() orderChanged = new EventEmitter<number[]>();

  private categoryService = inject(CategoryService);

  isDragMode = signal<boolean>(false);

  toggleDragMode(): void {
    this.isDragMode.set(!this.isDragMode());
  }

  isCategoryVisible(categoryId: number): boolean {
    const hasActivities = (this.activityCountByCategory.get(categoryId) ?? 0) > 0;
    if (hasActivities) return !this.hiddenCategoryIds.has(categoryId);
    return this.shownEmptyCategoryIds.has(categoryId);
  }

  async moveCategoryUp(index: number): Promise<void> {
    if (index === 0) return;
    const reordered = [...this.categories];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    this.categoryService.categories.set([...reordered]);
    const orderedIds = reordered.filter(c => c.id !== undefined).map(c => c.id!);
    await this.categoryService.reorder(orderedIds);
    this.orderChanged.emit(orderedIds);
  }

  async moveCategoryDown(index: number): Promise<void> {
    if (index === this.categories.length - 1) return;
    const reordered = [...this.categories];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    this.categoryService.categories.set([...reordered]);
    const orderedIds = reordered.filter(c => c.id !== undefined).map(c => c.id!);
    await this.categoryService.reorder(orderedIds);
    this.orderChanged.emit(orderedIds);
  }
}
