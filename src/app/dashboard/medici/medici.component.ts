import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Doctor } from '../../core/models/doctor.model';
import { DoctorMessage } from '../../core/models/doctor-hub.model';

@Component({
  selector: 'app-medici',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex flex-col h-full' },
  template: `
    <div class="flex flex-1 overflow-hidden min-h-0" style="height: calc(100dvh - 6.5rem)">

      <!-- Doctor list sidebar -->
      <aside class="w-64 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col overflow-hidden">
        <div class="px-4 py-4 border-b border-slate-100">
          <h2 class="text-sm font-extrabold text-slate-900">Messaggi Medici</h2>
          <p class="text-xs text-slate-400 mt-0.5">Scrivi messaggi privati ai singoli medici</p>
        </div>
        <div class="flex-1 overflow-y-auto py-2">
          @for (doctor of doctors(); track doctor.id) {
            <button
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left"
              [class.bg-tc-50]="selectedDoctorId() === doctor.id"
              [class.border-r-2]="selectedDoctorId() === doctor.id"
              [class.border-tc-500]="selectedDoctorId() === doctor.id"
              (click)="selectDoctor(doctor)"
            >
              <div class="relative flex-shrink-0">
                <img [src]="doctor.photoUrl" [alt]="doctor.name"
                     class="w-10 h-10 rounded-full object-cover" />
                <span
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  [class]="statusDot(doctor.id)"
                ></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-800 truncate">{{ doctor.name }}</p>
                <p class="text-xs text-slate-400 truncate">{{ doctor.specialty }}</p>
              </div>
              @if (unreadFor(doctor.id) > 0) {
                <span class="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {{ unreadFor(doctor.id) }}
                </span>
              }
            </button>
          }
        </div>
      </aside>

      <!-- Chat area -->
      <div class="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        @if (selectedDoctor(); as doctor) {
          <!-- Chat header -->
          <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-slate-100 flex-shrink-0">
            <img [src]="doctor.photoUrl" [alt]="doctor.name"
                 class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div class="flex-1">
              <p class="font-bold text-slate-900 text-sm">{{ doctor.name }}</p>
              <p class="text-xs text-slate-400">{{ doctor.specialty }} · <span [class]="statusText(doctor.id).cls">{{ statusText(doctor.id).label }}</span></p>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3" #messagesContainer>
            @if (threadMessages().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
                <svg class="w-12 h-12 opacity-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="font-semibold text-sm">Nessun messaggio con {{ doctor.name }}</p>
                <p class="text-xs mt-1">Scrivi qui sotto per iniziare la conversazione</p>
              </div>
            } @else {
              @for (msg of threadMessages(); track msg.id) {
                <div class="flex" [class.justify-end]="msg.fromType === 'segreteria'">
                  <div
                    class="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                    [class]="msg.fromType === 'segreteria'
                      ? 'bg-tc-500 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'"
                  >
                    @if (msg.fromType === 'medico') {
                      <p class="text-xs font-bold mb-1 opacity-60">{{ msg.fromName }}</p>
                    }
                    <p>{{ msg.body }}</p>
                    <p class="text-xs mt-1 opacity-60">{{ formatTime(msg.createdAt) }}</p>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Composer -->
          <div class="px-5 py-4 bg-white border-t border-slate-100 flex-shrink-0">
            <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-2 py-2 focus-within:border-tc-400 focus-within:ring-2 focus-within:ring-tc-100 transition-all duration-200">

              <textarea
                [(ngModel)]="messageText"
                (keydown.enter)="onEnterKey($any($event))"
                placeholder="Scrivi un messaggio privato a {{ doctor.name }}..."
                rows="1"
                class="flex-1 resize-none bg-transparent py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              ></textarea>

              <button
                (click)="sendMessage()"
                [disabled]="!messageText.trim()"
                class="w-9 h-9 rounded-xl bg-tc-500 hover:bg-tc-600 disabled:opacity-40 disabled:cursor-not-allowed
                      flex items-center justify-center text-white transition-all duration-150 flex-shrink-0"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>

            </div>

            <p class="text-xs text-slate-400 mt-2">Premi <kbd class="px-1 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> per inviare, <kbd class="px-1 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Shift+Enter</kbd> per andare a capo</p>
          </div>

        } @else {
          <!-- Empty state -->
          <div class="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <p class="font-bold text-slate-600 text-sm">Seleziona un medico</p>
            <p class="text-xs mt-1">Scegli un medico dalla lista a sinistra per avviare una conversazione privata</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class MediciComponent {
  private readonly mockData = inject(MockDataService);

  readonly doctors = this.mockData.doctors;
  readonly selectedDoctorId = signal<string | null>(null);
  messageText = '';

  readonly selectedDoctor = computed(() => {
    const id = this.selectedDoctorId();
    if (!id) return null;
    return this.doctors().find(d => d.id === id) || null;
  });

  readonly threadMessages = computed(() => {
    const id = this.selectedDoctorId();
    if (!id) return [];
    return this.mockData.doctorMessages()
      .filter(m =>
        (m.toId === id && m.fromType === 'segreteria') ||
        (m.fromId === id && m.fromType === 'medico' && (m.toId === 'segreteria' || m.toId === id))
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctorId.set(doctor.id);
    this.mockData.markMessagesReadForDoctor(doctor.id);
  }

  unreadFor(doctorId: string): number {
    return this.mockData.doctorMessages()
      .filter(m => m.toId === doctorId && !m.read && m.fromType === 'medico').length;
  }

  statusDot(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId);
    if (!s) return 'bg-slate-300';
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-400',
      in_visita: 'bg-amber-400',
      quasi_finito: 'bg-orange-400',
      terminato: 'bg-slate-300',
      assente: 'bg-rose-400',
    };
    return map[s.status] ?? 'bg-slate-300';
  }

  statusText(doctorId: string): { label: string; cls: string } {
    const s = this.mockData.getDoctorStatus(doctorId);
    if (!s) return { label: 'Sconosciuto', cls: 'text-slate-400' };
    const map: Record<string, { label: string; cls: string }> = {
      disponibile: { label: 'Disponibile', cls: 'text-emerald-600 font-semibold' },
      in_visita:   { label: 'In visita', cls: 'text-amber-600 font-semibold' },
      quasi_finito:{ label: 'Quasi finito', cls: 'text-orange-600 font-semibold' },
      terminato:   { label: 'Ha terminato', cls: 'text-slate-500' },
      assente:     { label: 'Assente', cls: 'text-rose-600 font-semibold' },
    };
    return map[s.status] ?? { label: s.status, cls: 'text-slate-400' };
  }

  sendMessage(): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId || !this.messageText.trim()) return;
    const doctor = this.selectedDoctor();
    if (!doctor) return;

    this.mockData.sendMessage({
      fromType: 'segreteria',
      fromId: 'segreteria',
      fromName: 'Segreteria',
      toId: doctorId,
      body: this.messageText.trim(),
    });
    this.messageText = '';
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
