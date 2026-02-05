import { ApplicationConfig, mergeApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from '../app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { firebaseConfig } from './firebase.config';

export const appConfig: ApplicationConfig = mergeApplicationConfig(
  {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(routes),
      provideClientHydration(withEventReplay()),
      provideAnimations(),
      provideHttpClient(withFetch())
    ]
  },
  firebaseConfig
);
