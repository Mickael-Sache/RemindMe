import { Injectable } from '@angular/core';
import { remindmeDB } from '@core/db/app-db';
import { Category } from '@core/models/category.model';

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Maison', icon: 'home', color: 'oklch(0.70 0.14 145)', order: 1 },
  { name: 'Santé', icon: 'favorite', color: 'oklch(0.62 0.20 25)', order: 2 },
  { name: 'Voiture', icon: 'directions_car', color: 'oklch(0.74 0.14 65)', order: 3 },
  { name: 'Finances', icon: 'savings', color: 'oklch(0.70 0.14 220)', order: 4 },
  { name: 'Jardin', icon: 'yard', color: 'oklch(0.70 0.14 160)', order: 5 },
  { name: 'Piscine', icon: 'pool', color: 'oklch(0.70 0.14 220)', order: 6 },
  { name: 'Admin', icon: 'description', color: 'oklch(0.65 0.10 280)', order: 7 },
];

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  async initializeDefaults(): Promise<void> {
    // Reinforced persistance (avoid clear db from browser)
    if (navigator.storage?.persist) {
      await navigator.storage.persist();
    }

    const count = await remindmeDB.categories.count();

    // Create categories only if db is empty
    if (count === 0) {
      await remindmeDB.categories.bulkAdd(DEFAULT_CATEGORIES);
    }

    const userCount = await remindmeDB.users.count();

    // Default user profile creation if empty
    if (userCount === 0) {
      await remindmeDB.users.add({
        name: 'Utilisateur',
        avatar: '😊',
        theme: 'dark',
        notificationsEnabled: false,
      });
    }
  }

  async exportToJson(): Promise<string> {
    const [categories, activities, users] = await Promise.all([
      remindmeDB.categories.toArray(),
      remindmeDB.activities.toArray(),
      remindmeDB.users.toArray(),
    ]);

    return JSON.stringify({ categories, activities, users }, null, 2);
  }

  async importFromJson(json: string): Promise<void> {
    const data = JSON.parse(json);

    await remindmeDB.transaction(
      'rw', // Transaction mode
      remindmeDB.categories, // Table #1
      remindmeDB.activities, // Table #2
      remindmeDB.users, // Table #3
      async () => {
        // Clear tables
        await remindmeDB.categories.clear();
        await remindmeDB.activities.clear();
        await remindmeDB.users.clear();

        // Add in Bulk
        await remindmeDB.categories.bulkAdd(data.categories);
        await remindmeDB.activities.bulkAdd(data.activities);
        await remindmeDB.users.bulkAdd(data.users);
      }
    );
  }

  async clearAll(): Promise<void> {
    await Promise.all([remindmeDB.categories.clear(), remindmeDB.activities.clear()]);
  }
}
