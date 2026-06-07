import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { BottomNav } from '../bottom-nav/bottom-nav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AsyncPipe, Header, Sidebar, BottomNav],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private breakpointObserver = inject(BreakpointObserver);

  isMobile$ = this.breakpointObserver
    .observe('(max-width: 767px)')
    .pipe(map(result => result.matches));
}
