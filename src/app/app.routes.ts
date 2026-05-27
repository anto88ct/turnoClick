import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/p/studio-demo',
    pathMatch: 'full',
  },
  {
    path: 'p',
    loadChildren: () =>
      import('./patient/patient.routes').then(m => m.patientRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'studio',
    loadChildren: () =>
      import('./studio-admin/studio-admin.routes').then(m => m.studioAdminRoutes),
  },
  {
    path: 'medico',
    loadChildren: () =>
      import('./medico/medico.routes').then(m => m.medicoRoutes),
  },
  {
    path: '**',
    redirectTo: '/p/studio-demo',
  },
];
