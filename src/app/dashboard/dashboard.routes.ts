import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'coda',
        loadComponent: () =>
          import('./live-queue/live-queue.component').then(m => m.LiveQueueComponent),
      },
      {
        path: 'inserimento',
        loadComponent: () =>
          import('./manual-entry/manual-entry.component').then(m => m.ManualEntryComponent),
      },
      {
        path: 'statistiche',
        loadComponent: () =>
          import('./statistics/statistics.component').then(m => m.StatisticsComponent),
      },
      {
        path: 'archivio',
        loadComponent: () =>
          import('./archive/archive.component').then(m => m.ArchiveComponent),
      },
      {
        path: 'clienti',
        loadComponent: () =>
          import('../pages/clients/clients-list.component').then(m => m.ClientsListComponent),
      },
      {
        path: 'configurazione',
        loadComponent: () =>
          import('./configuration/configuration.component').then(m => m.ConfigurationComponent),
      },
      {
        path: 'medici',
        loadComponent: () =>
          import('./medici/medici.component').then(m => m.MediciComponent),
      },
      {
        path: 'abbonamento',
        loadComponent: () =>
          import('../shared/subscription-status/subscription-status.component').then(m => m.SubscriptionStatusComponent),
      },
      {
        path: 'ticket',
        loadComponent: () =>
          import('../shared/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent),
      },
    ],
  },
];
