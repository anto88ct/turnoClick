import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcStatCardComponent } from '../../shared/tc-stat-card/tc-stat-card.component';
import { TcQueueRowComponent } from '../../shared/tc-queue-row/tc-queue-row.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { BookingStatus } from '../../core/models/booking.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, TcStatCardComponent, TcQueueRowComponent, TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="page-header">Panoramica giornaliera</h1>
        <p class="page-subheader">Studio Medico Dott. Rossi — aggiornamento in tempo reale</p>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <tc-stat-card label="In attesa" [value]="stats().inAttesa" sub="Paziente in coda" iconBg="bg-amber-50" valueColor="text-amber-600" [trend]="12">
          <svg icon class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="In visita" [value]="stats().inCorso" sub="Visite in corso" iconBg="bg-blue-50" valueColor="text-blue-600">
          <svg icon class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Completate" [value]="stats().completate" sub="Oggi" iconBg="bg-tc-50" valueColor="text-tc-600" [trend]="5">
          <svg icon class="w-5 h-5 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Tempo medio" [value]="stats().avgWaitMinutes + ' min'" sub="Attesa media" iconBg="bg-purple-50" valueColor="text-purple-600">
          <svg icon class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </tc-stat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Live queue preview -->
        <div class="lg:col-span-2">
          <div class="dashboard-card">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-tc-500 animate-pulse"></div>
                <h2 class="font-extrabold text-slate-900">Coda live</h2>
              </div>
              <a routerLink="/dashboard/coda"
                 class="text-xs font-bold text-tc-600 hover:text-tc-700 transition-colors">
                Gestisci →
              </a>
            </div>

            @if (activeQueue().length === 0) {
              <div class="text-center py-10 text-slate-400">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="font-semibold">Nessun paziente in attesa</p>
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                @for (booking of activeQueue().slice(0, 5); track booking.id) {
                  <tc-queue-row [booking]="booking" [showActions]="false" />
                }
                @if (activeQueue().length > 5) {
                  <div class="text-center py-2 text-xs font-bold text-slate-400">
                    + {{ activeQueue().length - 5 }} altri pazienti
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right column -->
        <div class="flex flex-col gap-5">
          <!-- Alerts -->
          <div class="dashboard-card">
            <h2 class="font-extrabold text-slate-900 mb-3">Avvisi</h2>
            @if (stats().noShow > 0) {
              <div class="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-200 mb-2">
                <svg class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div>
                  <p class="text-xs font-bold text-rose-700">{{ stats().noShow }} no-show oggi</p>
                  <p class="text-xs text-rose-600 mt-0.5">Pazienti non presentati</p>
                </div>
              </div>
            }
            <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <svg class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-xs font-bold text-amber-700">Tempo medio in crescita</p>
                <p class="text-xs text-amber-600 mt-0.5">+3 min rispetto a ieri</p>
              </div>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="dashboard-card">
            <h2 class="font-extrabold text-slate-900 mb-3">Riepilogo oggi</h2>
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center py-1.5 border-b border-tc-border/60">
                <span class="text-sm text-slate-600">Totale prenotazioni</span>
                <span class="font-extrabold text-slate-900">{{ stats().totalBookings }}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-tc-border/60">
                <span class="text-sm text-slate-600">No-show</span>
                <span class="font-extrabold text-rose-500">{{ stats().noShow }}</span>
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-sm text-slate-600">Tempo visita medio</span>
                <span class="font-extrabold text-slate-900">{{ stats().avgVisitMinutes }} min</span>
              </div>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="dashboard-card">
            <h2 class="font-extrabold text-slate-900 mb-3">Azioni rapide</h2>
            <div class="flex flex-col gap-2">
              <a routerLink="/dashboard/inserimento">
                <tc-button variant="primary" [fullWidth]="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                  Inserimento manuale
                </tc-button>
              </a>
              <a routerLink="/dashboard/statistiche">
                <tc-button variant="ghost" [fullWidth]="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Vedi statistiche
                </tc-button>
              </a>
              <a routerLink="/dashboard/clienti">
                <tc-button variant="ghost" [fullWidth]="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Anagrafiche Clienti
                </tc-button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OverviewComponent {
  private mockData = inject(MockDataService);
  readonly stats = this.mockData.dailyStats;
  readonly activeQueue = this.mockData.activeQueue;

  onStatusChange(event: { id: string; status: BookingStatus }): void {
    this.mockData.updateStatus(event.id, event.status);
  }
}
