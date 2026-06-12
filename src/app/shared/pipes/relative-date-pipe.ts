import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(lastDoneAt: string, cycleInDays: number): string {
    const lastDate = new Date(lastDoneAt);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + cycleInDays);

    const now = new Date();
    const diffDays = Math.round((nextDate.getTime() - now.getTime()) / 86_400_000);

    if (diffDays < 0)
      return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jours`;
  }
}
