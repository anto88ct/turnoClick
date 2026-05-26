import { Routes } from '@angular/router';

export const studioAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./studio-admin.component').then(m => m.StudioAdminComponent),
  },
];
