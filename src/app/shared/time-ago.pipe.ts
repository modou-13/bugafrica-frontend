import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    const s = (Date.now() - new Date(value).getTime()) / 1000;
    if (s < 60) return "à l'instant";
    const m = s / 60;
    if (m < 60) return `il y a ${Math.floor(m)} min`;
    const h = m / 60;
    if (h < 24) return `il y a ${Math.floor(h)} h`;
    const d = h / 24;
    if (d < 30) return `il y a ${Math.floor(d)} j`;
    return new Date(value).toLocaleDateString('fr-FR');
  }
}
