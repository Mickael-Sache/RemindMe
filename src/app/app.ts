import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  //templateUrl: './app.html',
  //styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('remindme');
  themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.applyStoredTheme();
  }
}
