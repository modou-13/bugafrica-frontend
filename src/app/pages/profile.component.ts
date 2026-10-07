import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, AvatarComponent],
  template: `
    <section class="page narrow">
      @if (auth.user(); as u) {
        <div class="card profile">
          <app-avatar [name]="u.username" [size]="84" />
          <h1>{{ u.username }}</h1>
          <p class="muted">{{ u.country || 'Pays non renseigné' }} · membre depuis {{ since() }}</p>
          <div class="stats">
            <div><b>{{ u.reputation }}</b><span>points de réputation</span></div>
            <div><b>{{ level().name }}</b><span>niveau actuel</span></div>
          </div>
          <div class="progress"><div [style.width.%]="level().progress"></div></div>
          <p class="muted small">{{ level().next }}</p>
        </div>

        <div class="card">
          
          <div class="actions">
            <a class="btn" routerLink="/">Trouver un bug à résoudre</a>
            <button class="btn btn-ghost" (click)="auth.logout()">Se déconnecter</button>
          </div>
        </div>
      }
    </section>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);

  since = computed(() => {
    const d = this.auth.user()?.createdAt;
    return d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';
  });

  level = computed(() => {
    const r = this.auth.user()?.reputation ?? 0;
    const levels = [
      { min: 0, name: 'Débutant' },
      { min: 15, name: 'Contributeur' },
      { min: 60, name: 'Expert' },
      { min: 150, name: 'Légende' },
    ];
    const i = levels.reduce((acc, l, idx) => (r >= l.min ? idx : acc), 0);
    const next = levels[i + 1];
    return {
      ...levels[i],
      progress: next ? Math.min(100, ((r - levels[i].min) / (next.min - levels[i].min)) * 100) : 100,
      next: next ? `Encore ${next.min - r} pts pour devenir ${next.name}` : 'Niveau maximum atteint !',
    };
  });

  ngOnInit() { this.auth.refreshMe().subscribe({ error: () => {} }); } // met la réputation à jour
}
