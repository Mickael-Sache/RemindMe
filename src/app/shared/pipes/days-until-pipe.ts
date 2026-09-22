import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysUntil',
})
export class DaysUntilPipe implements PipeTransform {
  transform(lastDoneAt: string, cycleInDays: number): number {
    const last = new Date(lastDoneAt).getTime();
    const nextdue = last + cycleInDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return Math.ceil((nextdue - now) / (24 * 60 * 60 * 1000));
  }
}
