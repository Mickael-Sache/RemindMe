import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { StorageService } from '@core/services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
})
export class App implements OnInit {
  protected readonly title = signal('remindme');
  themeService = inject(ThemeService);
  storageService = inject(StorageService);

  async ngOnInit(): Promise<void> {
    this.themeService.applyStoredTheme();
    await this.storageService.initializeDefaults();
  }
}
