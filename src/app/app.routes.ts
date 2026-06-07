import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        // Dashboard
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        // Calendar
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar').then(m => m.Calendar),
      },
      {
        // Settings
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then(m => m.Settings),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard', // route fallback to dashboard
  },
];
