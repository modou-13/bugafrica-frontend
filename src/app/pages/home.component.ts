import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Bug } from '../core/models';
import { ToastService } from '../core/toast.service';
import { AvatarComponent } from '../shared/avatar.component';
import { TimeAgoPipe } from '../shared/time-ago.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, AvatarComponent, TimeAgoPipe],
  template: `
    <section class="hero">
      <span class="blob b1"></span><span class="blob b2"></span>
      <h1>Un bug qui te bloque ?<br><span>La communauté a la solution.</span></h1>
      <div class="search">
        <input placeholder="Rechercher un bug, une erreur, une techno…" [ngModel]="q()" (ngModelChange)="onSearch($event)">
      </div>
    </section>

    <section class="page">
      <div class="filters">
        <div class="seg">
          <button [class.on]="solved() === null" (click)="setSolved(null)">Tous</button>
          <button [class.on]="solved() === false" (click)="setSolved(false)">Non résolus</button>
          <button [class.on]="solved() === true" (click)="setSolved(true)">Résolus</button>
        </div>
        <span class="muted">{{ total() }} bug{{ total() > 1 ? 's' : '' }}</span>
      </div>

      <div class="chips">
        @for (t of tags(); track t) {
          <button class="chip" [class.on]="tag() === t" (click)="pickTag(t)">#{{ t }}</button>
        }
      </div>

      @if (loading()) {
        @for (i of [1, 2, 3]; track i) { <div class="card skeleton"></div> }
      } @else if (bugs().length === 0) {
        <div class="empty">
          <h3>Aucun bug trouvé</h3>
          <a routerLink="/bugs/new" class="btn">Poser un bug</a>
        </div>
      } @else {
        @for (b of bugs(); track b.id) {
          <a class="card bug" [routerLink]="['/bugs', b.id]">
            <div class="bug-main">
              <span class="badge" [class.ok]="b.solved">{{ b.solved ? '✓ Résolu' : 'Ouvert' }}</span>
              <h3>{{ b.title }}</h3>
              <p class="clamp">{{ b.description }}</p>
              <div class="tags">@for (t of b.tags; track t) { <span class="tag">#{{ t }}</span> }</div>
            </div>
            <div class="bug-meta">
              <app-avatar [name]="b.author.username" [size]="28" />
              <span><b>{{ b.author.username }}</b>@if (b.author.country) { · {{ b.author.country }} }</span>
              <span class="muted">{{ b.createdAt | timeAgo }}</span>
            </div>
          </a>
        }
        @if (pages() > 1) {
          <div class="pager">
            <button class="btn btn-ghost btn-sm" [disabled]="page() === 0" (click)="go(page() - 1)">← Précédent</button>
            <span>Page {{ page() + 1 }} / {{ pages() }}</span>
            <button class="btn btn-ghost btn-sm" [disabled]="page() + 1 >= pages()" (click)="go(page() + 1)">Suivant →</button>
          </div>
        }
      }
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  bugs = signal<Bug[]>([]);
  tags = signal<string[]>([]);
  total = signal(0);
  pages = signal(0);
  page = signal(0);
  loading = signal(true);
  q = signal('');
  tag = signal('');
  solved = signal<boolean | null>(null);
  private timer: any;

  ngOnInit() {
    this.api.tags().subscribe({ next: t => this.tags.set(t) });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.searchBugs({ q: this.q(), tag: this.tag(), solved: this.solved(), page: this.page() }).subscribe({
      next: r => {
        this.bugs.set(r.content);
        this.total.set(r.page.totalElements);
        this.pages.set(r.page.totalPages);
        this.loading.set(false);
      },
      error: e => { this.loading.set(false); this.toast.error(e); },
    });
  }

  onSearch(v: string) {
    this.q.set(v);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.page.set(0); this.load(); }, 350);
  }

  pickTag(t: string) { this.tag.set(this.tag() === t ? '' : t); this.page.set(0); this.load(); }
  setSolved(v: boolean | null) { this.solved.set(v); this.page.set(0); this.load(); }
  go(p: number) { this.page.set(p); this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
