import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthResponse, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem('token'));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token());

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(tap(r => this.save(r)));
  }

  register(body: { username: string; email: string; password: string; country: string | null }) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, body).pipe(tap(r => this.save(r)));
  }

  refreshMe() {
    return this.http.get<User>(`${API_URL}/users/me`).pipe(tap(u => this.setUser(u)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.user.set(null);
    this.router.navigateByUrl('/');
  }

  private save(r: AuthResponse) {
    localStorage.setItem('token', r.token);
    this.token.set(r.token);
    this.setUser(r.user);
  }

  private setUser(u: User) {
    localStorage.setItem('user', JSON.stringify(u));
    this.user.set(u);
  }

  private readUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
  }
}
