import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { DoctorStatusType } from '../../core/models/doctor-hub.model';

@Component({
  selector: 'app-medico-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      <!-- Patient status card -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-50">
          <h2 class="text-base font-extrabold text-slate-900">Stato Visita Corrente</h2>
          <p class="text-xs text-slate-400 mt-0.5">Aggiorna il tuo stato: la segreteria vedrà tutto in tempo reale</p>
        </div>
        <div class="p-5">
          <!-- Current status display -->
          <div class="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-slate-50">
            <span class="w-3 h-3 rounded-full animate-pulse flex-shrink-0" [class]="currentStatusDot()"></span>
            <div>
              <p class="text-sm font-extrabold text-slate-800">{{ currentStatusLabel() }}</p>
              @if (currentStatus()?.patientName) {
                <p class="text-xs text-slate-500 font-medium">Paziente: {{ currentStatus()?.patientName }}</p>
              }
              @if (currentStatus()?.updatedAt) {
                <p class="text-xs text-slate-400">Aggiornato {{ formatRelative(currentStatus()!.updatedAt) }}</p>
              }
            </div>
          </div>

          <!-- Status buttons -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              (click)="setStatus('disponibile')"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 text-center"
              [class]="currentStatus()?.status === 'disponibile'
                ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
                : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'"
            >
              <span class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              <span class="text-xs font-bold text-slate-700 leading-tight">Disponibile</span>
            </button>

            <button
              (click)="setStatus('in_visita')"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 text-center"
              [class]="currentStatus()?.status === 'in_visita'
                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                : 'border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/50'"
            >
              <span class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <span class="text-xs font-bold text-slate-700 leading-tight">Cliente in visita</span>
            </button>

            <button
              (click)="setStatus('quasi_finito')"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 text-center"
              [class]="currentStatus()?.status === 'quasi_finito'
                ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'"
            >
              <span class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span class="text-xs font-bold text-slate-700 leading-tight">Sto per finire</span>
            </button>

            <button
              (click)="setStatus('terminato')"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 text-center"
              [class]="currentStatus()?.status === 'terminato'
                ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-200'
                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'"
            >
              <span class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span class="text-xs font-bold text-slate-700 leading-tight">Ho terminato</span>
            </button>
          </div>
        </div>
      </div>

      <!-- All doctors status -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-50">
          <h2 class="text-base font-extrabold text-slate-900">Colleghi in Studio</h2>
          <p class="text-xs text-slate-400 mt-0.5">Stato attuale di tutti i medici presenti</p>
        </div>
        <div class="divide-y divide-slate-50">
          @for (doctor of doctors(); track doctor.id) {
            @if (doctor.id !== activeDoctorId()) {
              <div class="flex items-center gap-4 px-5 py-3.5">
                <div class="relative flex-shrink-0">
                  <img [src]="doctor.photoUrl" [alt]="doctor.name" class="w-10 h-10 rounded-full object-cover" />
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                        [class]="getDoctorStatusDot(doctor.id)"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-800">{{ doctor.name }}</p>
                  <p class="text-xs text-slate-400">{{ doctor.specialty }}</p>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full" [class]="getDoctorStatusBadge(doctor.id)">
                    {{ getDoctorStatusLabel(doctor.id) }}
                  </span>
                  @if (getDoctorStatus(doctor.id)?.patientName) {
                    <span class="text-xs text-slate-400 mt-0.5">{{ getDoctorStatus(doctor.id)?.patientName }}</span>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Today's queue for this doctor -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 class="text-base font-extrabold text-slate-900">La Mia Coda Oggi</h2>
            <p class="text-xs text-slate-400 mt-0.5">Pazienti assegnati a me</p>
          </div>
          <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
            {{ myQueue().length }} pazienti
          </span>
        </div>
        @if (myQueue().length === 0) {
          <div class="px-6 py-10 text-center text-slate-400">
            <svg class="w-10 h-10 mx-auto opacity-25 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="font-semibold text-sm">Nessun paziente in coda</p>
          </div>
        } @else {
          <div class="divide-y divide-slate-50">
            @for (booking of myQueue(); track booking.id) {
              <div class="flex items-center gap-4 px-5 py-3.5">
                <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-600 flex-shrink-0">
                  {{ booking.position || '—' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-800">{{ booking.patientName }}</p>
                  <p class="text-xs text-slate-400">{{ booking.requestType }}</p>
                </div>
                <div class="text-right">
                  <span
                    class="text-xs font-bold px-2.5 py-1 rounded-full"
                    [class]="booking.status === 'in_corso'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ booking.status === 'in_corso' ? 'In visita' : 'In attesa' }}
                  </span>
                  <p class="text-xs text-slate-400 mt-0.5">{{ formatTime(booking.estimatedStartAt) }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class MedicoOverviewComponent {
  private readonly mockData = inject(MockDataService);
  readonly doctors = this.mockData.doctors;
  readonly activeDoctorId = this.mockData.activeDoctorId;

  readonly currentStatus = computed(() =>
    this.mockData.getDoctorStatus(this.activeDoctorId())
  );

  readonly myQueue = computed(() =>
    this.mockData.activeQueue().filter(b => b.doctorId === this.activeDoctorId())
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  );

  setStatus(status: DoctorStatusType): void {
    const active = this.mockData.activeQueue().find(b => b.doctorId === this.activeDoctorId() && b.status === 'in_corso');
    this.mockData.setDoctorStatus(this.activeDoctorId(), status, active?.patientName);
  }

  readonly currentStatusLabel = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'Disponibile — pronto per il prossimo paziente',
      in_visita: 'In visita con paziente',
      quasi_finito: 'Sto per finire — prepara il prossimo paziente',
      terminato: 'Ho terminato la visita',
      assente: 'Assente',
    };
    return s ? (map[s] ?? s) : 'Disponibile';
  });

  readonly currentStatusDot = computed(() => {
    const s = this.currentStatus()?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-500',
      in_visita: 'bg-amber-500',
      quasi_finito: 'bg-orange-500',
      terminato: 'bg-slate-400',
      assente: 'bg-rose-500',
    };
    return s ? (map[s] ?? 'bg-slate-400') : 'bg-emerald-500';
  });

  getDoctorStatus(doctorId: string) {
    return this.mockData.getDoctorStatus(doctorId);
  }

  getDoctorStatusDot(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-400', in_visita: 'bg-amber-400',
      quasi_finito: 'bg-orange-400', terminato: 'bg-slate-300', assente: 'bg-rose-400',
    };
    return s ? (map[s] ?? 'bg-slate-300') : 'bg-slate-300';
  }

  getDoctorStatusLabel(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    const map: Record<string, string> = {
      disponibile: 'Disponibile', in_visita: 'In visita',
      quasi_finito: 'Quasi finito', terminato: 'Terminato', assente: 'Assente',
    };
    return s ? (map[s] ?? s) : 'N/D';
  }

  getDoctorStatusBadge(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-100 text-emerald-700',
      in_visita: 'bg-amber-100 text-amber-700',
      quasi_finito: 'bg-orange-100 text-orange-700',
      terminato: 'bg-slate-100 text-slate-600',
      assente: 'bg-rose-100 text-rose-700',
    };
    return s ? (map[s] ?? 'bg-slate-100 text-slate-600') : 'bg-slate-100 text-slate-600';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  formatRelative(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'adesso';
    if (diff < 60) return `${diff} min fa`;
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
