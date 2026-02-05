import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from '../app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

/**
 * Application Configuration
 * 
 * Configured for Angular 20+ best practices:
 * - Zoneless change detection for better performance
 * - SSR with hydration and event replay
 * - Modern HTTP client with fetch API
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zoneless change detection (Angular 20+ best practice)
    provideZonelessChangeDetection(),
    
    // Global error listeners
    provideBrowserGlobalErrorListeners(),
    
    // Router configuration
    provideRouter(routes),
    
    // SSR with hydration and event replay
    provideClientHydration(withEventReplay()),
    
    // Animations
    provideAnimations(),
    
    // HTTP client with fetch API
    provideHttpClient(withFetch())
  ]
};
