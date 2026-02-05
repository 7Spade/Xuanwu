import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'demo',
    loadComponent: () => 
      import('../features/demo/pages/firebase-demo.component').then(m => m.FirebaseDemoComponent)
  },
  {
    path: '',
    redirectTo: '/demo',
    pathMatch: 'full'
  }
];
