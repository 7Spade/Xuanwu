import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

/**
 * Auth Guard - Protects authenticated routes
 *
 * This functional guard checks if a user is authenticated before allowing access to a route.
 * If the user is not authenticated, they are redirected to the login page with a return URL
 * so they can be redirected back after successful authentication.
 *
 * @example
 * ```typescript
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 *
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns `true` if authenticated, otherwise a `UrlTree` redirecting to login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  // Check if user is authenticated
  if (appState.isAuthenticated()) {
    return true; // Allow access
  }

  // Redirect to login with return URL for post-auth redirect
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
