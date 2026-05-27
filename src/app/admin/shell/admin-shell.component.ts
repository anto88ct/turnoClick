import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { HelpTicketService } from '../../core/services/help-ticket.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-[calc(100dvh-2.25rem)] bg-slate-50 overflow-hidden">

      <!-- ── Sidebar ──────────────────────────────────────────────────────── -->
      <aside
        [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-40 flex flex-col w-64 bg-slate-900 h-full
               transition-transform duration-300 ease-in-out flex-shrink-0 overflow-y-auto no-scrollbar"
      >
        <!-- Logo -->
        <div class="px-5 pt-6 pb-5 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                 style="background: linear-gradient(135deg,#6366f1,#4f46e5)">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <span class="font-extrabold text-white text-sm">TurnoClick</span>
              <p class="text-[10px] text-white/50 font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <!-- Section: Piattaforma -->
          <p class="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] px-3 mb-1 mt-2">Piattaforma</p>

          <a routerLink="/admin" routerLinkActive="!bg-white/15 !text-white"
             [routerLinkActiveOptions]="{ exact: true }" class="sidebar-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Panoramica globale
          </a>

          <a routerLink="/admin/clienti" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Studi clienti
            <span class="ml-auto bg-white/10 text-white/70 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ studioCount() }}
            </span>
          </a>

          <a routerLink="/admin/piani" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Piani abbonamento
          </a>

          <!-- Section: Supporto -->
          <p class="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] px-3 mb-1 mt-4">Supporto</p>

          <a routerLink="/admin/ticket" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            Ticket supporto
            @if (openTickets() > 0) {
              <span class="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {{ openTickets() }}
              </span>
            }
          </a>

          <!-- Section: Onboarding -->
          <p class="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] px-3 mb-1 mt-4">Onboarding</p>

          <a routerLink="/admin/nuovo-studio" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Crea nuovo studio
          </a>
        </nav>

        <!-- Bottom: Admin user -->
        <div class="px-4 py-4 border-t border-white/10 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                 style="background: linear-gradient(135deg,#6366f1,#4f46e5)">AD</div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-white">Antonio D'Arrigo</p>
              <p class="text-xs text-white/40">TurnoClick HQ</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Backdrop mobile -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 bg-black/50 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- ── Main ──────────────────────────────────────────────────────────── -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <button class="lg:hidden w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"
                  (click)="toggleSidebar()">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1">
            <p class="text-sm font-extrabold text-slate-900">Pannello Super Admin</p>
            <p class="text-xs text-slate-500">{{ today }}</p>
          </div>
          <!-- Ticket alert -->
          @if (openTickets() > 0) {
            <a routerLink="/admin/ticket"
               class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-extrabold hover:bg-rose-100 transition-colors">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {{ openTickets() }} ticket aperto{{ openTickets() > 1 ? 'i' : '' }}
            </a>
          }
          <span class="flex items-center gap-1.5 px-3 py-1.5 bg-tc-50 text-tc-700 rounded-xl text-xs font-bold hidden sm:flex">
            <span class="w-2 h-2 rounded-full bg-tc-500 animate-pulse"></span>
            Piattaforma operativa
          </span>
        </div>

        <!-- Page content -->
        <div class="flex-1 overflow-y-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  private mockData  = inject(MockDataService);
  private ticketSvc = inject(HelpTicketService);

  readonly sidebarOpen  = signal(false);
  readonly studioCount  = computed(() => this.mockData.studios().length);
  readonly openTickets  = computed(() =>
    this.ticketSvc.tickets().filter(t => t.status !== 'chiuso').length
  );

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  }
}
