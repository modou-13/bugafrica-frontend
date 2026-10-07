import { Injectable, signal } from '@angular/core';

export function errorMessage(err: any): string {
  const body = err?.error;
  if (body?.errors) return Object.values(body.errors).join(' · ');
  if (body?.detail) return body.detail;
  if (err?.status === 0) return "Impossible de joindre le serveur. Vérifie que l'API tourne.";
  return 'Une erreur est survenue';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<{ id: number; text: string; type: 'ok' | 'error' }[]>([]);
  private n = 0;

  show(text: string, type: 'ok' | 'error' = 'ok') {
    const id = ++this.n;
    this.items.update(l => [...l, { id, text, type }]);
    setTimeout(() => this.items.update(l => l.filter(t => t.id !== id)), 4000);
  }

  error(err: any) { this.show(errorMessage(err), 'error'); }
}
