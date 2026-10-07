import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ViewTransitions = fondu animé entre les pages ; InputBinding = les paramètres de route arrivent en @Input
    provideRouter(routes, withComponentInputBinding(), withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
