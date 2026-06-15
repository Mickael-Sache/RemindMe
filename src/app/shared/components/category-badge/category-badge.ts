import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './category-badge.html',
  styleUrl: './category-badge.scss',
})
export class CategoryBadge {
  @Input({ required: true }) category!: Category;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
