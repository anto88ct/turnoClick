import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./global-overview/global-overview.component').then(m => m.GlobalOverviewComponent),
      },
      {
        path: 'clienti',
        loadComponent: () =>
          import('./clients/clients.component').then(m => m.ClientsComponent),
      },
      {
        path: 'piani',
        loadComponent: () =>
          import('./plans/plans.component').then(m => m.PlansComponent),
      },
    ],
  },
];
