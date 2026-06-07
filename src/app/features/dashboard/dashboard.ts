import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page-placeholder">
      <h2>Dashboard</h2>
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
  //templateUrl: './dashboard.html',
  //styleUrl: './dashboard.scss',
})
export class Dashboard {}
