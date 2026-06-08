export interface User {
  id?: number;
  name: string;
  avatar: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}
