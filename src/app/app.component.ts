import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ToastService } from './core/toast.service';
import { AvatarComponent } from './shared/avatar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent],
  template: `
    <header class="nav">
      <div class="container nav-in">
        <a routerLink="/" class="brand"><span class="logo">&lt;/&gt;</span>Bug<b>Africa</b></a>
        <button class="burger" (click)="open.set(!open())" aria-label="Menu">{{ open() ? '✕' : '☰' }}</button>
        <nav class="links" [class.open]="open()" (click)="open.set(false)">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Les bugs</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/bugs/new" class="btn btn-gold btn-sm">+ Poser un bug</a>
            <a routerLink="/profile" routerLinkActive="active" class="me">
              <app-avatar [name]="auth.user()?.username ?? '?'" [size]="30" />
              <span>{{ auth.user()?.username }}</span>
              <span class="pill">{{ auth.user()?.reputation }} pts</span>
            </a>
            <button class="btn btn-ghost btn-sm" (click)="auth.logout()">Déconnexion</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active">Connexion</a>
            <a routerLink="/register" class="btn btn-sm">Créer un compte</a>
          }
        </nav>
      </div>
    </header>

    <main class="container"><router-outlet /></main>


    <div class="toasts">
      @for (t of toast.items(); track t.id) {
        <div class="toast" [class.err]="t.type === 'error'">{{ t.text }}</div>
      }
    </div>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  open = signal(false);
}
