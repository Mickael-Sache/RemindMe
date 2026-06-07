import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  template: `
    <div class="page-placeholder">
      <h2>Calendar</h2>
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
  //templateUrl: './calendar.html',
  //styleUrl: './calendar.scss',
})
export class Calendar {}
