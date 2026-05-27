import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-[calc(100dvh-2.25rem)] bg-tc-surface overflow-hidden">
      <!-- Sidebar -->
      <aside
        [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-40 flex flex-col w-60 bg-slate-900 h-full
               transition-transform duration-300 ease-in-out flex-shrink-0"
      >
        <!-- Logo -->
        <div class="px-5 pt-6 pb-5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-tc-500 to-tc-700 flex items-center justify-center shadow-tc">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <span class="font-extrabold text-white text-base">TurnoClick</span>
              <p class="text-xs text-white/50 font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
          <a
            routerLink="/admin"
            routerLinkActive="!bg-white/15 !text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Panoramica globale
          </a>
          <a
            routerLink="/admin/clienti"
            routerLinkActive="!bg-white/15 !text-white"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Studi clienti
            <span class="ml-auto bg-white/10 text-white/70 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ studioCount() }}
            </span>
          </a>
          <a
            routerLink="/admin/piani"
            routerLinkActive="!bg-white/15 !text-white"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Piani abbonamento
          </a>
        </nav>

        <div class="px-4 py-4 border-t border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-tc-500 to-tc-700 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div>
              <p class="text-sm font-bold text-white">Admin</p>
              <p class="text-xs text-white/50">TurnoClick HQ</p>
            </div>
          </div>
        </div>
      </aside>

      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 bg-black/50 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-tc-border shadow-sm flex-shrink-0">
          <button class="lg:hidden w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"
                  (click)="toggleSidebar()">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-900">Pannello di controllo globale</p>
            <p class="text-xs text-slate-500">{{ today }}</p>
          </div>
          <span class="flex items-center gap-1.5 px-3 py-1.5 bg-tc-50 text-tc-700 rounded-xl text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-tc-500 animate-pulse"></span>
            Piattaforma operativa
          </span>
        </div>
        <div class="flex-1 overflow-y-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  private mockData = inject(MockDataService);
  readonly sidebarOpen = signal(false);
  readonly studioCount = () => this.mockData.studios().length;

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  }
}
