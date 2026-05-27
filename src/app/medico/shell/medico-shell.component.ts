import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { Doctor } from '../../core/models/doctor.model';

@Component({
  selector: 'app-medico-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-[calc(100dvh-2.25rem)] bg-slate-50 overflow-hidden">

      <!-- Sidebar -->
      <aside
        [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-40 flex flex-col w-64 bg-slate-900 h-full
               transition-transform duration-300 ease-in-out flex-shrink-0"
      >
        <!-- Logo -->
        <div class="px-5 pt-6 pb-5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <span class="font-extrabold text-white text-base">TurnoClick</span>
              <p class="text-xs text-white/50 font-medium">Dashboard Medico</p>
            </div>
          </div>
        </div>

        <!-- Doctor selector -->
        <div class="mx-4 mt-4">
          <label class="text-xs text-white/40 font-bold uppercase tracking-wider block mb-1.5">Medico attivo</label>
          <select
            [value]="activeDoctorId()"
            (change)="onDoctorChange($event)"
            class="w-full bg-white/10 text-white text-sm font-semibold rounded-xl px-3 py-2
                   border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            @for (doc of doctors(); track doc.id) {
              <option [value]="doc.id" class="bg-slate-800 text-white">{{ doc.name }}</option>
            }
          </select>
        </div>

        <!-- Status indicator -->
        @if (activeDoctor(); as doctor) {
          <div class="mx-4 mt-3 px-3 py-2.5 rounded-xl"
               [class]="statusBg()">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full animate-pulse" [class]="statusDot()"></span>
              <span class="text-xs font-bold" [class]="statusTextCls()">{{ statusLabel() }}</span>
            </div>
            @if (currentStatus()?.patientName) {
              <p class="text-xs mt-0.5 opacity-70 font-medium" [class]="statusTextCls()">
                Paziente: {{ currentStatus()?.patientName }}
              </p>
            }
          </div>
        }

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <a routerLink="/medico" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Panoramica
          </a>
          <a routerLink="/medico/messaggi" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Messaggi
            @if (unreadCount() > 0) {
              <span class="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {{ unreadCount() }}
              </span>
            }
          </a>
          <a routerLink="/medico/calendario" routerLinkActive="!bg-white/15 !text-white" class="sidebar-link">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Calendario
          </a>
        </nav>

        <!-- Doctor card -->
        @if (activeDoctor(); as doctor) {
          <div class="px-4 py-4 border-t border-white/10">
            <div class="flex items-center gap-3">
              <img [src]="doctor.photoUrl" [alt]="doctor.name"
                   class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              <div class="min-w-0">
                <p class="text-sm font-bold text-white truncate">{{ doctor.name }}</p>
                <p class="text-xs text-white/50 truncate">{{ doctor.specialty }}</p>
              </div>
            </div>
          </div>
        }
      </aside>

      <!-- Overlay mobile -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 bg-black/50 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <button class="lg:hidden w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"
                  (click)="toggleSidebar()">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-900">Dashboard Medico</p>
            <p class="text-xs text-slate-500">{{ today }}</p>
          </div>
          <span class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Studio attivo
          </span>
        </div>
        <div class="flex-1 overflow-y-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class MedicoShellComponent {
  private readonly mockData = inject(MockDataService);
  readonly sidebarOpen = signal(false);
  readonly doctors = this.mockData.doctors;
  readonly activeDoctorId = this.mockData.activeDoctorId;

  readonly activeDoctor = computed(() =>
    this.doctors().find(d => d.id === this.activeDoctorId()) ?? null
  );

  readonly currentStatus = computed(() =>
    this.mockData.getDoctorStatus(this.activeDoctorId())
  );

  readonly unreadCount = computed(() =>
    this.mockData.doctorMessages()
      .filter(m => m.toId === this.activeDoctorId() && !m.read).length
  );

  readonly statusLabel = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'Disponibile',
      in_visita: 'In visita',
      quasi_finito: 'Quasi finito',
      terminato: 'Ha terminato',
      assente: 'Assente',
    };
    return s ? (map[s] ?? s) : 'Disponibile';
  });

  readonly statusDot = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-400',
      in_visita: 'bg-amber-400',
      quasi_finito: 'bg-orange-400',
      terminato: 'bg-slate-400',
      assente: 'bg-rose-400',
    };
    return s ? (map[s] ?? 'bg-slate-400') : 'bg-emerald-400';
  });

  readonly statusBg = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-500/20',
      in_visita: 'bg-amber-500/20',
      quasi_finito: 'bg-orange-500/20',
      terminato: 'bg-slate-500/20',
      assente: 'bg-rose-500/20',
    };
    return s ? (map[s] ?? 'bg-slate-500/20') : 'bg-emerald-500/20';
  });

  readonly statusTextCls = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'text-emerald-300',
      in_visita: 'text-amber-300',
      quasi_finito: 'text-orange-300',
      terminato: 'text-slate-300',
      assente: 'text-rose-300',
    };
    return s ? (map[s] ?? 'text-slate-300') : 'text-emerald-300';
  });

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  onDoctorChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.mockData.setActiveDoctor(id);
  }

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  }
}
