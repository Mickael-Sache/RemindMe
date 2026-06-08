import Dexie, { Table } from 'dexie';
import { Category } from '@core/models/category.model';
import { Activity } from '@core/models/activity.model';
import { User } from '@core/models/user.model';

export class AppDatabase extends Dexie {
  categories!: Table<Category, number>;
  activities!: Table<Activity, number>;
  users!: Table<User, number>;

  constructor() {
    super('RemindMeDB');
    this.version(1).stores({
      categories: '++id, name, order',
      activities: '++id, categoryId, lastDoneAt',
      users: '++id',
    });
  }
}

export const remindmeDB = new AppDatabase();
