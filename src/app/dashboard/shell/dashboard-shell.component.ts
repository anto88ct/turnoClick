import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',             label: 'Panoramica',  icon: 'home',    exact: true },
  { path: '/dashboard/coda',        label: 'Coda live',   icon: 'queue' },
  { path: '/dashboard/inserimento', label: 'Inserimento', icon: 'add' },
  { path: '/dashboard/clienti',     label: 'Clienti',     icon: 'users' },
  { path: '/dashboard/statistiche', label: 'Statistiche', icon: 'chart' },
  { path: '/dashboard/archivio',    label: 'Archivio',    icon: 'archive' },
];

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-[calc(100dvh-2.25rem)] bg-tc-surface overflow-hidden">
      <!-- Sidebar -->
      <aside
        [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-40 flex flex-col w-64 bg-tc-900 h-full
               transition-transform duration-300 ease-in-out flex-shrink-0"
      >
        <!-- Logo -->
        <div class="px-5 pt-6 pb-5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-tc-500 flex items-center justify-center shadow-tc">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <span class="font-extrabold text-white text-base">TurnoClick</span>
              <p class="text-xs text-white/50 font-medium">Segreteria</p>
            </div>
          </div>
        </div>

        <!-- Studio pill -->
        <div class="mx-4 mt-4 px-3 py-2.5 bg-white/10 rounded-xl">
          <p class="text-xs text-white/50 font-semibold mb-0.5">Studio attivo</p>
          <p class="text-sm font-bold text-white truncate">Studio Medico Dott. Rossi</p>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="!bg-white/15 !text-white"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="sidebar-link"
            >
              <span class="w-5 h-5 flex-shrink-0" [innerHTML]="getIcon(item.icon)"></span>
              {{ item.label }}
              @if (item.icon === 'queue') {
                <span class="ml-auto bg-tc-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {{ waitingCount().length }}
                </span>
              }
            </a>
          }
        </nav>

        <!-- Bottom -->
        <div class="px-4 py-4 border-t border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-tc-600 flex items-center justify-center text-white text-xs font-bold">
              SR
            </div>
            <div>
              <p class="text-sm font-bold text-white">Segreteria</p>
              <p class="text-xs text-white/50">Piano Professional</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Sidebar overlay (mobile) -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Top bar -->
        <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-tc-border shadow-sm flex-shrink-0">
          <button
            class="lg:hidden w-9 h-9 rounded-xl bg-tc-50 flex items-center justify-center text-tc-700"
            (click)="toggleSidebar()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-900">Buongiorno 👋</p>
            <p class="text-xs text-slate-500">{{ today }}</p>
          </div>
          <!-- Suspended badge -->
          @if (suspended()) {
            <span class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              Prenotazioni sospese
            </span>
          } @else {
            <span class="flex items-center gap-1.5 px-3 py-1.5 bg-tc-50 text-tc-700 rounded-xl text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-tc-500 animate-pulse"></span>
              Studio aperto
            </span>
          }
        </div>

        <!-- Page content -->
        <div class="flex-1 overflow-y-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class DashboardShellComponent {
  private mockData = inject(MockDataService);
  readonly navItems = NAV_ITEMS;
  readonly sidebarOpen = signal(false);
  readonly waitingCount = this.mockData.waitingQueue;
  readonly suspended = this.mockData.suspended;

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      home: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round"
                 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
             </svg>`,
      queue: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>`,
      add: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>`,
      chart: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>`,
      archive: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>`,
      settings: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                   <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                 </svg>`,
      studio: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round"
                   d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
               </svg>`,
      users: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>`,
    };
    return icons[name] ?? icons['home'];
  }
}
