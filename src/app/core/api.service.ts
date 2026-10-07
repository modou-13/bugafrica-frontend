import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config';
import { Answer, Bug, BugPayload, PageResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  searchBugs(f: { q?: string; tag?: string; solved?: boolean | null; page?: number; size?: number }) {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 10);
    if (f.q) params = params.set('q', f.q);
    if (f.tag) params = params.set('tag', f.tag);
    if (f.solved !== null && f.solved !== undefined) params = params.set('solved', f.solved);
    return this.http.get<PageResponse<Bug>>(`${API_URL}/bugs`, { params });
  }

  getBug(id: number) { return this.http.get<Bug>(`${API_URL}/bugs/${id}`); }
  createBug(b: BugPayload) { return this.http.post<Bug>(`${API_URL}/bugs`, b); }
  updateBug(id: number, b: BugPayload) { return this.http.put<Bug>(`${API_URL}/bugs/${id}`, b); }
  deleteBug(id: number) { return this.http.delete<void>(`${API_URL}/bugs/${id}`); }

  answers(bugId: number) { return this.http.get<Answer[]>(`${API_URL}/bugs/${bugId}/answers`); }
  addAnswer(bugId: number, body: { content: string; codeSnippet: string | null }) {
    return this.http.post<Answer>(`${API_URL}/bugs/${bugId}/answers`, body);
  }
  acceptAnswer(id: number) { return this.http.post<Answer>(`${API_URL}/answers/${id}/accept`, {}); }

  tags() { return this.http.get<string[]>(`${API_URL}/tags`); }
}
