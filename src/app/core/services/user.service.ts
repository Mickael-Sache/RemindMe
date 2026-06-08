import { Injectable, signal } from '@angular/core';
import { remindmeDB } from '@core/db/app-db';
import { User } from '@core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  currentUser = signal<User | null>(null);

  // CRUD - Read
  async getUser(): Promise<void> {
    const user = await remindmeDB.users.get(1);
    this.currentUser.set(user ?? null);
  }

  // CRUD - Update
  async updateUser(changes: Partial<User>): Promise<void> {
    await remindmeDB.users.update(1, changes);
    this.currentUser.update(u => (u ? { ...u, ...changes } : u));
  }
}
