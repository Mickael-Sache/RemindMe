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
    this.categories.set(data);
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
}
