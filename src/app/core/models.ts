export interface Author { id: number; username: string; country?: string | null; reputation: number; }
export interface User { id: number; username: string; email: string; country?: string | null;
  reputation: number; role: 'USER' | 'ADMIN'; createdAt: string; }
export interface Bug { id: number; title: string; description: string; codeSnippet?: string | null;
  solved: boolean; author: Author; tags: string[]; createdAt: string; }
export interface Answer { id: number; bugId: number; content: string; codeSnippet?: string | null;
  accepted: boolean; author: Author; createdAt: string; }
export interface AuthResponse { token: string; tokenType: string; user: User; }
export interface PageResponse<T> { content: T[]; page: { size: number; number: number; totalElements: number; totalPages: number }; }
export interface BugPayload { title: string; description: string; codeSnippet: string | null; tags: string[]; }
