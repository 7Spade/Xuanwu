import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

/**
 * No-Auth Guard - Protects public/login routes
 *
 * This functional guard prevents authenticated users from accessing public routes
 * (like login or signup pages). If a user is already authenticated, they are
 * redirected to the dashboard.
 *
 * @example
 * ```typescript
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [noAuthGuard]
 * }
 * ```
 *
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns `true` if not authenticated, otherwise a `UrlTree` redirecting to dashboard
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  // Check if user is NOT authenticated
  if (!appState.isAuthenticated()) {
    return true; // Allow access (user is not logged in)
  }

  // Redirect to dashboard (user is already authenticated)
  return router.createUrlTree(['/dashboard']);
};
