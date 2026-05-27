import { Routes } from '@angular/router';

export const medicoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/medico-shell.component').then(m => m.MedicoShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./overview/medico-overview.component').then(m => m.MedicoOverviewComponent),
      },
      {
        path: 'messaggi',
        loadComponent: () =>
          import('./messaggi/medico-messaggi.component').then(m => m.MedicoMessaggiComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./calendario/medico-calendario.component').then(m => m.MedicoCalendarioComponent),
      },
    ],
  },
];
