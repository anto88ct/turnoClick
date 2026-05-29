import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Panoramica', icon: 'home', exact: true },
  { path: '/dashboard/coda', label: 'Coda live', icon: 'queue' },
  { path: '/dashboard/inserimento', label: 'Inserimento', icon: 'add' },
  { path: '/dashboard/clienti', label: 'Clienti', icon: 'users' },
  { path: '/dashboard/statistiche', label: 'Statistiche', icon: 'chart' },
  { path: '/dashboard/archivio', label: 'Archivio', icon: 'archive' },
  { path: '/dashboard/medici', label: 'Medici', icon: 'doctors' },
  { path: '/dashboard/abbonamento', label: 'Abbonamento', icon: 'subscription' },
  { path: '/dashboard/ticket', label: 'I Miei Ticket', icon: 'ticket' },
];

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div
      [class.overflow-hidden]="sidebarOpen()"
      class="flex h-screen lg:h-[calc(100vh-2.25rem)] bg-tc-surface overflow-hidden"
    >

      <aside
        [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-40 flex flex-col w-64 bg-tc-900 h-dvh lg:h-full
               transition-transform duration-300 ease-in-out flex-shrink-0"
        (touchmove)="$event.stopPropagation()"
      >
        <div class="px-5 py-3 lg:pt-6 lg:pb-5 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-tc-500 flex items-center justify-center shadow-tc">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex flex-col justify-center">
              <span class="font-extrabold text-white text-base leading-tight">TurnoClick</span>
              <p class="text-xs text-white/50 font-medium leading-none mt-0.5">Segreteria</p>
            </div>
          </div>
        </div>

        <div class="mx-4 mt-2 lg:mt-4 px-3 py-1.5 lg:py-2.5 bg-white/10 rounded-xl flex-shrink-0 flex flex-col justify-center">
          <p class="text-[10px] lg:text-xs text-white/50 font-semibold mb-0.5 leading-none">Studio attivo</p>
          <p class="text-xs lg:text-sm font-bold text-white truncate leading-tight">Studio Medico Dott. Rossi</p>
        </div>

        <nav class="flex-1 px-3 py-3 lg:py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="!bg-white/15 !text-white"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="sidebar-link flex items-center gap-3 w-full py-2 px-3 rounded-xl text-white/70 hover:text-white"
            >
              <span class="w-5 h-5 flex-shrink-0 flex items-center justify-center" [innerHTML]="getIcon(item.icon)"></span>
              <span class="text-sm font-medium pt-[1px]">{{ item.label }}</span>

              @if (item.icon === 'queue') {
                <span class="ml-auto bg-tc-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] h-5">
                  {{ waitingCount().length }}
                </span>
              }
              @if (item.icon === 'doctors' && doctorUnread() > 0) {
                <span class="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] h-5">
                  {{ doctorUnread() }}
                </span>
              }
            </a>
          }
        </nav>

        <div class="px-4 pt-4 pb-10 lg:pb-4 border-t border-white/10 flex-shrink-0 bg-tc-900 z-50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-tc-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              SR
            </div>
            <div class="flex flex-col justify-center min-w-0">
              <p class="text-sm font-bold text-white truncate leading-tight">Segreteria</p>
              <p class="text-xs text-white/50 truncate leading-none mt-0.5">Piano Professional</p>
            </div>
          </div>
        </div>
      </aside>

      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/50 lg:hidden"
          (touchmove)="$event.preventDefault()"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <main [class.pointer-events-none]="sidebarOpen()" class="flex-1 flex flex-col overflow-hidden h-full">
        <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-tc-border shadow-sm flex-shrink-0">
          <button
            class="lg:hidden w-9 h-9 rounded-xl bg-tc-50 flex items-center justify-center text-tc-700"
            (click)="toggleSidebar()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex flex-col justify-center-1 flex-1">
            <p class="text-sm font-bold text-slate-900 leading-tight">Buongiorno 👋</p>
            <p class="text-xs text-slate-500 leading-none mt-0.5">{{ today }}</p>
          </div>
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

        <div class="flex-1 overflow-y-auto h-full">
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
  readonly doctorUnread = computed(() =>
    this.mockData.doctorMessages().filter(m => m.fromType === 'medico' && !m.read).length
  );

  // Blocca lo scroll del body a livello globale del browser quando la sidebar è aperta
  constructor() {
    effect(() => {
      if (this.sidebarOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      home: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
      queue: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
      add: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>`,
      chart: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
      archive: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>`,
      settings: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      studio: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
      users: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
      doctors: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
      subscription: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
      ticket: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`,
    };
    return icons[name] ?? icons['home'];
  }
}