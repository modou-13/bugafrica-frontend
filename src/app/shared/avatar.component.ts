import { Component, computed, input } from '@angular/core';

const COLORS = ['#0284c7', '#0369a1', '#2563eb', '#1d4ed8', '#0891b2', '#0e7490', '#3b82f6', '#0ea5e9'];

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<span class="avatar" [style.background]="bg()" [style.width.px]="size()" [style.height.px]="size()"
    [style.font-size.px]="size() * 0.42">{{ initial() }}</span>`,
})
export class AvatarComponent {
  name = input.required<string>();
  size = input(36);
  initial = computed(() => this.name().charAt(0).toUpperCase());
  bg = computed(() => {
    let h = 0;
    for (const c of this.name()) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
    return COLORS[h];
  });
}
