import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>('light');

  constructor() {
    this.applyStoredTheme();
  }

  // Read user or system preference for theme
  applyStoredTheme(): void {
    // Option #1 : Preference stored by user
    const stored = localStorage.getItem('remindme-theme');

    // User has previously set a theme preference
    if (stored === 'light' || stored === 'dark') {
      this.currentTheme.set(stored);
      this.applyThemeClass(stored);
      return;
    }

    // Option #2 : Preference set on system
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = preferDark ? 'dark' : 'light';
    this.currentTheme.set(theme);
    this.applyThemeClass(theme);
  }

  // Toggle between theme
  toggleTheme(): void {
    const next: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(next);
    this.applyThemeClass(next);

    // Set into localStorage theme key
    localStorage.setItem('remindme-theme', next);
  }

  // Setter from user's parameters
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyThemeClass(theme);

    // Set into localStorage theme key
    localStorage.setItem('remindme-theme', theme);
  }

  // Set CSS style class
  private applyThemeClass(theme: Theme): void {
    const body = document.body;

    // Remove class  from body
    body.classList.remove('theme-light', 'theme-dark');

    // Apply current related theme class
    body.classList.add(`theme-${theme}`);
  }
}
