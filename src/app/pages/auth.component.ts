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
            <input name="password" type="password" [(ngModel)]="password" placeholder="8 caractères minimum" required minlength="8"
              [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'">
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
