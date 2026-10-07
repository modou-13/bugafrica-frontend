import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Answer, Bug } from '../core/models';
import { ToastService } from '../core/toast.service';
import { AvatarComponent } from '../shared/avatar.component';
import { TimeAgoPipe } from '../shared/time-ago.pipe';

@Component({
  selector: 'app-bug-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, AvatarComponent, TimeAgoPipe],
  template: `
    <section class="page narrow">
      <a class="back" routerLink="/">← Tous les bugs</a>

      @if (bug(); as b) {
        <article class="card">
          <div class="row">
            <span class="badge" [class.ok]="b.solved">{{ b.solved ? '✓ Résolu' : 'Ouvert' }}</span>
            @if (canManage()) {
              <span class="spacer"></span>
              <div class="icon-actions">
                <a class="icon-btn" [routerLink]="['/bugs', b.id, 'edit']" title="Modifier" aria-label="Modifier ce bug">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </a>
                <button type="button" class="icon-btn danger" (click)="remove(b)" title="Supprimer" aria-label="Supprimer ce bug">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            }
          </div>
          <h1>{{ b.title }}</h1>
          <div class="who">
            <app-avatar [name]="b.author.username" [size]="32" />
            <span><b>{{ b.author.username }}</b> <span class="pill">{{ b.author.reputation }} pts</span>
              @if (b.author.country) { · {{ b.author.country }} }</span>
            <span class="muted">· {{ b.createdAt | timeAgo }}</span>
          </div>
          <p class="prose">{{ b.description }}</p>
          @if (b.codeSnippet) {
            <div class="code">
              <div class="code-bar"><span>code</span><button type="button" (click)="copy(b.codeSnippet)">Copier</button></div>
              <pre><code>{{ b.codeSnippet }}</code></pre>
            </div>
          }
          <div class="tags">@for (t of b.tags; track t) { <span class="tag">#{{ t }}</span> }</div>
        </article>

        <h2 class="section">{{ answers().length }} réponse{{ answers().length > 1 ? 's' : '' }}</h2>
        @for (a of answers(); track a.id) {
          <article class="card answer" [class.accepted]="a.accepted">
            @if (a.accepted) { <div class="solution">✓ Solution acceptée</div> }
            <div class="who">
              <app-avatar [name]="a.author.username" [size]="30" />
              <span><b>{{ a.author.username }}</b> <span class="pill">{{ a.author.reputation }} pts</span>
                @if (a.author.country) { · {{ a.author.country }} }</span>
              <span class="muted">· {{ a.createdAt | timeAgo }}</span>
            </div>
            <p class="prose">{{ a.content }}</p>
            @if (a.codeSnippet) {
              <div class="code">
                <div class="code-bar"><span>code</span><button type="button" (click)="copy(a.codeSnippet)">Copier</button></div>
                <pre><code>{{ a.codeSnippet }}</code></pre>
              </div>
            }
            @if (canManage() && !a.accepted) {
              <button class="btn btn-gold btn-sm" (click)="accept(a)">✓ Marquer comme solution</button>
            }
          </article>
        } @empty {
          <div class="empty small"><p>Personne n'a encore répondu. Tu as la solution ?</p></div>
        }

        <h2 class="section">Ta réponse</h2>
        @if (auth.isLoggedIn()) {
          <form class="card form" (ngSubmit)="send(b)">
            <textarea name="content" rows="5" [(ngModel)]="content" maxlength="10000"
              placeholder="Explique la solution étape par étape…" required></textarea>
            <textarea name="code" rows="5" class="mono" [(ngModel)]="code" maxlength="10000" spellcheck="false"
              placeholder="Code (optionnel)"></textarea>
            <div class="actions"><button class="btn" type="submit" [disabled]="sending()">{{ sending() ? 'Envoi…' : 'Publier ma réponse' }}</button></div>
          </form>
        } @else {
          <div class="card empty small">
            <p>Connecte-toi pour partager ta solution.</p>
            <a class="btn" routerLink="/login" [queryParams]="{ returnUrl: '/bugs/' + b.id }">Se connecter</a>
          </div>
        }
      } @else if (loading()) {
        <div class="card skeleton tall"></div>
      } @else {
        <div class="empty"><h3>Ce bug n'existe pas (ou plus).</h3>
          <a routerLink="/" class="btn">Retour aux bugs</a></div>
      }
    </section>
  `,
})
export class BugDetailComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  id = input.required<string>();

  bug = signal<Bug | null>(null);
  answers = signal<Answer[]>([]);
  loading = signal(true);
  sending = signal(false);
  content = signal('');
  code = signal('');

  canManage = computed(() => {
    const b = this.bug(), u = this.auth.user();
    return !!b && !!u && (b.author.id === u.id || u.role === 'ADMIN');
  });

  ngOnInit() {
    this.api.getBug(+this.id()).subscribe({
      next: b => { this.bug.set(b); this.loading.set(false); this.loadAnswers(); },
      error: () => this.loading.set(false),
    });
  }

  private loadAnswers() { this.api.answers(+this.id()).subscribe({ next: a => this.answers.set(a) }); }

  send(b: Bug) {
    if (!this.content().trim()) return;
    this.sending.set(true);
    this.api.addAnswer(b.id, { content: this.content(), codeSnippet: this.code().trim() ? this.code() : null }).subscribe({
      next: () => { this.content.set(''); this.code.set(''); this.sending.set(false); this.toast.show('Réponse publiée'); this.loadAnswers(); },
      error: e => { this.sending.set(false); this.toast.error(e); },
    });
  }

  accept(a: Answer) {
    this.api.acceptAnswer(a.id).subscribe({
      next: () => {
        this.toast.show(`Solution acceptée, +15 pts pour ${a.author.username}`);
        this.loadAnswers();
        this.bug.update(b => b && { ...b, solved: true });
      },
      error: e => this.toast.error(e),
    });
  }

  remove(b: Bug) {
    if (!confirm('Supprimer ce bug et toutes ses réponses ?')) return;
    this.api.deleteBug(b.id).subscribe({
      next: () => { this.toast.show('Bug supprimé'); this.router.navigateByUrl('/'); },
      error: e => this.toast.error(e),
    });
  }

  copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => this.toast.show('Code copié'));
  }
}