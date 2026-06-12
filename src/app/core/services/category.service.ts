import { Injectable, signal } from '@angular/core';
import { remindmeDB } from '@core/db/app-db';
import { Category } from '@core/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  categories = signal<Category[]>([]);

  // CRUD - Read
  async loadAll(): Promise<void> {
    const data = await remindmeDB.categories.orderBy('order').toArray();
    this.categories.set(data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));
  }

  // CRUD - Create
  async add(category: Omit<Category, 'id'>): Promise<void> {
    const newId = await remindmeDB.categories.add(category);
    this.categories.update(list => [...list, { ...category, id: newId }]);
  }

  // CRUD - Update
  async update(id: number, changes: Partial<Category>): Promise<void> {
    await remindmeDB.categories.update(id, changes);
    this.categories.update(list => list.map(c => (c.id === id ? { ...c, ...changes } : c)));
  }

  // CRUD - Delete
  async delete(id: number): Promise<void> {
    await remindmeDB.categories.delete(id);
    this.categories.update(list => list.filter(c => c.id !== id));
  }

  // Update order for Activity
  async reorder(orderedIds: number[]): Promise<void> {
    // Update order for each categories
    const updates = orderedIds.map((id, index) =>
      remindmeDB.categories.update(id, { order: index })
    );
    await Promise.all(updates);

    // Update Signal with new order
    this.categories.update(list =>
      [...list].sort((a, b) => {
        const orderA = orderedIds.indexOf(a.id!);
        const orderB = orderedIds.indexOf(b.id!);
        return orderA - orderB;
      })
    );
  }
}
