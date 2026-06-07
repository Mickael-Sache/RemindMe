import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatIconModule],
  template: `
    <!-- Temporary button to test -->
    <div style="position: fixed; top: 1rem; right: 1rem; z-index: 9999;">
      <button mat-icon-button (click)="themeService.toggleTheme()">
        <mat-icon>
          <!-- Change icon on click -->
          {{ themeService.currentTheme() === 'light' ? 'dark_mode' : 'light_mode' }}
        </mat-icon>
      </button>
    </div>
    <router-outlet />
  `,
  //templateUrl: './app.html',
  //styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('remindme');
  themeService = inject(ThemeService);
}
