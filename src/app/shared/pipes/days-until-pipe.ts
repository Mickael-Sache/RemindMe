import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysUntil',
})
export class DaysUntilPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
