import { ApplicationConfig, mergeApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from '../app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { firebaseConfig } from './firebase.config';

export const appConfig: ApplicationConfig = mergeApplicationConfig(
  {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(routes),
      provideClientHydration(withEventReplay())
    ]
  },
  firebaseConfig
);
