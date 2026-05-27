import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  {
    path: ':slug',
    loadComponent: () =>
      import('./landing/landing.component').then(m => m.PatientLandingComponent),
  },
  {
    path: ':slug/coda',
    loadComponent: () =>
      import('./join-queue/join-queue.component').then(m => m.JoinQueueComponent),
  },
  {
    path: ':slug/stato',
    loadComponent: () =>
      import('./queue-status/queue-status.component').then(m => m.QueueStatusComponent),
  },
  {
    path: ':slug/prenota',
    loadComponent: () =>
      import('./book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
  },
  {
    path: ':slug/totem',
    loadComponent: () =>
      import('./totem/totem.component').then(m => m.TotemComponent),
  },
];
