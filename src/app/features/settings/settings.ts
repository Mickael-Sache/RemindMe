import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="page-placeholder">
      <h2>Settings</h2>
      <p>Work in progress</p>
    </div>
  `,
  styles: [
    `
      .page-placeholder {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary);
      }
    `,
  ],
  //imports: [],
  //templateUrl: './settings.html',
  //styleUrl: './settings.scss',
})
export class Settings {}
