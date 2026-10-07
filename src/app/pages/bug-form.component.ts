import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-bug-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page narrow">
      <a class="back" [routerLink]="id() ? ['/bugs', id()] : '/'">← Retour</a>
      <h1>{{ id() ? 'Modifier mon bug' : 'Poser un bug' }}</h1>

      <form class="card form" (ngSubmit)="save()">
        <label>Titre
          <input name="title" [(ngModel)]="title" maxlength="200" placeholder="Ex : Erreur 401 sur l'API Wave en production" required>
        </label>

        <label>Décris le problème
          <textarea name="description" rows="6" [(ngModel)]="description" maxlength="10000"
            placeholder="Que voulais-tu faire ? Que se passe-t-il ? Qu'as-tu déjà essayé ?" required></textarea>
        </label>

        <label>Code ou message d'erreur <span class="muted">(optionnel)</span>
          <textarea name="code" rows="8" class="mono" [(ngModel)]="code" maxlength="10000" spellcheck="false"
            placeholder="Colle ici ton code ou la stack trace"></textarea>
        </label>

        <div class="field">
          <span class="label">Tags <span class="muted">({{ tags().length }}/5)</span></span>
          <div class="tag-input">
            @for (t of tags(); track t) {
              <span class="tag removable">#{{ t }} <button type="button" (click)="removeTag(t)" aria-label="Retirer">×</button></span>
            }
            <input name="tagInput" [ngModel]="tagInput()" (ngModelChange)="tagInput.set($event)" (keydown)="onTagKey($event)"
              (blur)="addTag(tagInput())" placeholder="Tape un tag puis Entrée" [disabled]="tags().length >= 5">
          </div>
          <div class="chips">
            @for (s of suggestions(); track s) {
              <button type="button" class="chip" (click)="addTag(s)">+ {{ s }}</button>
            }
          </div>
        </div>

        <div class="actions">
          <a class="btn btn-ghost" [routerLink]="id() ? ['/bugs', id()] : '/'">Annuler</a>
          <button class="btn" type="submit" [disabled]="saving()">{{ saving() ? 'Envoi…' : (id() ? 'Enregistrer' : 'Publier mon bug') }}</button>
        </div>
      </form>
    </section>
  `,
})
export class BugFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  id = input<string>(); // présent uniquement sur /bugs/:id/edit

  title = signal('');
  description = signal('');
  code = signal('');
  tags = signal<string[]>([]);
  tagInput = signal('');
  allTags = signal<string[]>([]);
  saving = signal(false);

  suggestions = computed(() => this.allTags().filter(t => !this.tags().includes(t)).slice(0, 12));

  ngOnInit() {
    this.api.tags().subscribe({ next: t => this.allTags.set(t) });
    const id = this.id();
    if (id) {
      this.api.getBug(+id).subscribe({
        next: b => {
          this.title.set(b.title);
          this.description.set(b.description);
          this.code.set(b.codeSnippet ?? '');
          this.tags.set(b.tags);
        },
        error: e => { this.toast.error(e); this.router.navigateByUrl('/'); },
      });
    }
  }

  addTag(raw: string) {
    const t = raw.trim().toLowerCase().replace(/^#/, '');
    if (!t) return;
    if (!/^[a-z0-9+#._-]{1,40}$/.test(t)) { this.toast.show('Tag invalide (lettres, chiffres, + # . _ -)', 'error'); return; }
    if (this.tags().includes(t) || this.tags().length >= 5) { this.tagInput.set(''); return; }
    this.tags.update(l => [...l, t]);
    this.tagInput.set('');
  }

  removeTag(t: string) { this.tags.update(l => l.filter(x => x !== t)); }

  onTagKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); this.addTag(this.tagInput()); }
    else if (e.key === 'Backspace' && !this.tagInput()) this.tags.update(l => l.slice(0, -1));
  }

  save() {
    if (!this.title().trim() || !this.description().trim()) {
      this.toast.show('Le titre et la description sont obligatoires', 'error');
      return;
    }
    const body = { title: this.title(), description: this.description(), codeSnippet: this.code().trim() ? this.code() : null, tags: this.tags() };
    const id = this.id();
    this.saving.set(true);
    (id ? this.api.updateBug(+id, body) : this.api.createBug(body)).subscribe({
      next: b => { this.toast.show(id ? 'Bug mis à jour' : 'Bug publié'); this.router.navigate(['/bugs', b.id]); },
      error: e => { this.saving.set(false); this.toast.error(e); },
    });
  }
}
