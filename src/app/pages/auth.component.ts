import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { AFRICAN_COUNTRIES } from '../core/countries';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page auth">
      <div class="card auth-card">
        <h1>{{ mode() === 'login' ? 'Connexion' : 'Inscription' }}</h1>

        <form (ngSubmit)="submit()" class="form">
          @if (mode() === 'register') {
            <label>Pseudo
              <input name="username" [(ngModel)]="username" placeholder="awa_dev" required minlength="3" maxlength="30" autocomplete="username">
            </label>
          }
          <label>Email
            <input name="email" type="email" [(ngModel)]="email" placeholder="toi@exemple.com" required autocomplete="email">
          </label>
          <label>Mot de passe
            <div class="pw">
              <input name="password" [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password"
                placeholder="8 caractères minimum" required minlength="8"
                [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'">
              <button type="button" class="eye" (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                [attr.aria-pressed]="showPassword()">
                @if (showPassword()) {
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                    <path d="M1 1l22 22"/>
                  </svg>
                } @else {
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
          </label>
          @if (mode() === 'register') {
            <label>Pays
              <select name="country" [(ngModel)]="country">
                <option value="">— Choisis ton pays —</option>
                @for (c of countries; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </label>
          }
          <button class="btn btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Un instant…' : (mode() === 'login' ? 'Se connecter' : 'Créer mon compte') }}
          </button>
        </form>

        <p class="switch">
          @if (mode() === 'login') { Pas encore de compte ? <a routerLink="/register" [queryParams]="{ returnUrl: returnUrl() }">Inscris-toi</a> }
          @else { Déjà inscrit ? <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl() }">Connecte-toi</a> }
        </p>
      </div>
    </section>
  `,
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Reçus automatiquement depuis la route (data) et l'URL (?returnUrl=...)
  mode = input<'login' | 'register'>('login');
  returnUrl = input<string>();

  countries = AFRICAN_COUNTRIES;
  username = signal('');
  email = signal('');
  password = signal('');
  country = signal('');
  loading = signal(false);
  showPassword = signal(false);

  submit() {
    if (!this.email() || !this.password()) return;
    this.loading.set(true);
    const request$ = this.mode() === 'login'
      ? this.auth.login(this.email(), this.password())
      : this.auth.register({ username: this.username(), email: this.email(), password: this.password(),
          country: this.country() || null });

    request$.subscribe({
      next: r => {
        this.toast.show(`Bienvenue ${r.user.username} !`);
        const dest = this.returnUrl();
        this.router.navigateByUrl(dest && dest.startsWith('/') && !dest.startsWith('//') ? dest : '/');
      },
      error: e => { this.loading.set(false); this.toast.error(e); },
    });
  }
}