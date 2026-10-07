import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', title: 'BugAfrica – Entraide pour devs africains',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'login', title: 'Connexion – BugAfrica', data: { mode: 'login' },
    loadComponent: () => import('./pages/auth.component').then(m => m.AuthComponent) },
  { path: 'register', title: 'Inscription – BugAfrica', data: { mode: 'register' },
    loadComponent: () => import('./pages/auth.component').then(m => m.AuthComponent) },
  { path: 'bugs/new', title: 'Poser un bug – BugAfrica', canActivate: [authGuard],
    loadComponent: () => import('./pages/bug-form.component').then(m => m.BugFormComponent) },
  { path: 'bugs/:id/edit', title: 'Modifier – BugAfrica', canActivate: [authGuard],
    loadComponent: () => import('./pages/bug-form.component').then(m => m.BugFormComponent) },
  { path: 'bugs/:id', title: 'Bug – BugAfrica',
    loadComponent: () => import('./pages/bug-detail.component').then(m => m.BugDetailComponent) },
  { path: 'profile', title: 'Mon profil – BugAfrica', canActivate: [authGuard],
    loadComponent: () => import('./pages/profile.component').then(m => m.ProfileComponent) },
  { path: '**', redirectTo: '' },
];
