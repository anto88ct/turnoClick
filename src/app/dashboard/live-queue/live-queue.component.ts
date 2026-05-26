import { Component, inject, signal, computed } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, moveItemInArray } from '@angular/cdk/drag-drop';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcBadgeComponent } from '../../shared/tc-badge/tc-badge.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { Booking, BookingStatus, REQUEST_TYPE_LABELS } from '../../core/models/booking.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-live-queue',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, TcBadgeComponent, TcButtonComponent, FormsModule],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="page-header">Coda live</h1>
          <div class="flex items-center gap-2 mt-1">
            <div class="w-2 h-2 rounded-full bg-tc-500 animate-pulse"></div>
            <p class="page-subheader">Aggiornamento automatico ogni 5 secondi</p>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <!-- Global delay -->
          <div class="flex items-center gap-2 bg-white rounded-xl border border-tc-border px-3 py-2 shadow-sm">
            <span class="text-xs font-bold text-slate-600">Ritardo globale</span>
            <div class="flex items-center gap-1">
              <button (click)="addDelay(5)"
                      class="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                +5'
              </button>
              <button (click)="addDelay(10)"
                      class="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                +10'
              </button>
              <button (click)="addDelay(15)"
                      class="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                +15'
              </button>
            </div>
          </div>

          <!-- Suspend toggle -->
          <button
            (click)="toggleSuspend()"
            [class]="suspended()
              ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
              : 'bg-white text-slate-700 border-tc-border hover:border-tc-400'"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-sm
                   transition-all duration-200 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            {{ suspended() ? 'Riattiva prenotazioni' : 'Sospendi prenotazioni' }}
          </button>
        </div>
      </div>

      @if (suspended()) {
        <div class="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 mb-4 flex items-center gap-3">
          <svg class="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p class="text-sm font-bold text-rose-700">
            Le prenotazioni online sono sospese. I pazienti non possono aggiungersi alla coda.
          </p>
        </div>
      }

      <!-- Summary pills -->
      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span class="text-xs font-bold text-amber-700">In attesa</span>
          <span class="text-lg font-extrabold text-amber-600">{{ waitingQueue().length }}</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <span class="text-xs font-bold text-blue-700">In visita</span>
          <span class="text-lg font-extrabold text-blue-600">{{ inCorsoQueue().length }}</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-tc-50 border border-tc-200 rounded-xl">
          <span class="text-xs font-bold text-tc-700">Completate</span>
          <span class="text-lg font-extrabold text-tc-600">{{ completedCount() }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- In corso -->
        <div class="dashboard-card">
          <h2 class="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            In visita ora
          </h2>
          @if (inCorsoQueue().length === 0) {
            <div class="text-center py-8 text-slate-400">
              <p class="font-semibold">Nessuna visita in corso</p>
            </div>
          } @else {
            <div class="flex flex-col gap-3">
              @for (b of inCorsoQueue(); track b.id) {
                <div class="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <p class="font-extrabold text-slate-900">{{ b.patientName }}</p>
                      <p class="text-sm text-slate-500">{{ b.doctorName }}</p>
                    </div>
                    <tc-badge [variant]="b.status" />
                  </div>
                  <div class="text-xs font-semibold text-blue-600 mb-3">
                    {{ getRequestLabel(b) }} · Inizio: {{ getTime(b.startedAt) }}
                    · Durata: {{ getElapsed(b.startedAt) }}
                  </div>
                  <div class="flex gap-2">
                    <tc-button size="sm" variant="secondary"
                               (clicked)="updateStatus(b.id, 'in_attesa')">
                      Sto finendo
                    </tc-button>
                    <tc-button size="sm" variant="primary"
                               (clicked)="updateStatus(b.id, 'completata')">
                      Terminata
                    </tc-button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- In attesa (drag-and-drop) -->
        <div class="dashboard-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              In attesa
            </h2>
            <span class="text-xs text-slate-400 font-semibold">Trascina per riordinare</span>
          </div>

          @if (waitingQueue().length === 0) {
            <div class="text-center py-8 text-slate-400">
              <p class="font-semibold">Nessun paziente in attesa</p>
            </div>
          } @else {
            <div
              cdkDropList
              [cdkDropListData]="localWaiting()"
              (cdkDropListDropped)="onDrop($event)"
              class="flex flex-col gap-2"
            >
              @for (b of localWaiting(); track b.id; let i = $index) {
                <div cdkDrag [cdkDragData]="b"
                     class="p-3.5 bg-white border border-tc-border rounded-2xl
                            hover:border-tc-300 hover:shadow-card transition-all duration-200 cursor-grab active:cursor-grabbing">
                  <div cdkDragPlaceholder class="h-14 bg-tc-50 border-2 border-dashed border-tc-300 rounded-2xl"></div>
                  <div class="flex items-center gap-3">
                    <div cdkDragHandle class="text-slate-300 hover:text-slate-400 p-1 flex-shrink-0">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                      </svg>
                    </div>
                    <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-extrabold
                                flex items-center justify-center flex-shrink-0">
                      {{ i + 1 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-sm text-slate-900 truncate">{{ b.patientName }}</p>
                      <p class="text-xs text-slate-500">{{ getRequestLabel(b) }} · {{ b.doctorName }}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                      <p class="text-xs font-bold text-slate-700">{{ getEstimatedTime(b) }}</p>
                      <p class="text-xs text-slate-400">stimato</p>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-2.5 pl-10">
                    <tc-button size="sm" variant="primary"
                               (clicked)="updateStatus(b.id, 'in_corso')">
                      In visita
                    </tc-button>
                    <tc-button size="sm" variant="ghost"
                               (clicked)="updateStatus(b.id, 'no_show')">
                      No-show
                    </tc-button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Completed today -->
      <div class="dashboard-card mt-5">
        <h2 class="font-extrabold text-slate-900 mb-3">Completate oggi</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-tc-border">
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Paziente</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Medico</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Completata</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Stato</th>
              </tr>
            </thead>
            <tbody>
              @for (b of completedToday(); track b.id) {
                <tr class="border-b border-tc-border/50 hover:bg-tc-50/50 transition-colors">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">{{ b.patientName }}</td>
                  <td class="py-2.5 px-3 text-slate-600">{{ getRequestLabel(b) }}</td>
                  <td class="py-2.5 px-3 text-slate-600">{{ b.doctorName }}</td>
                  <td class="py-2.5 px-3 text-slate-500">{{ getTime(b.completedAt) }}</td>
                  <td class="py-2.5 px-3">
                    <tc-badge [variant]="b.status" />
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-6 text-slate-400 font-semibold">
                    Nessuna visita completata oggi
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class LiveQueueComponent {
  private mockData = inject(MockDataService);

  readonly waitingQueue = this.mockData.waitingQueue;
  readonly inCorsoQueue = this.mockData.inCorsoQueue;
  readonly suspended = this.mockData.suspended;

  readonly localWaiting = computed(() => [...this.mockData.waitingQueue()]);

  readonly completedToday = computed(() =>
    this.mockData.queue().filter(b =>
      (b.status === 'completata' || b.status === 'no_show') &&
      b.createdAt.toDateString() === new Date().toDateString()
    )
  );

  readonly completedCount = computed(() => this.completedToday().length);

  updateStatus(id: string, status: BookingStatus): void {
    this.mockData.updateStatus(id, status);
  }

  toggleSuspend(): void {
    this.mockData.toggleSuspended();
  }

  addDelay(minutes: number): void {
    this.mockData.addGlobalDelay(minutes);
  }

  onDrop(event: CdkDragDrop<Booking[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.mockData.reorderWaiting(event.previousIndex, event.currentIndex);
    }
  }

  getRequestLabel(b: Booking): string {
    return REQUEST_TYPE_LABELS[b.requestType];
  }

  getTime(date?: Date): string {
    if (!date) return '—';
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getEstimatedTime(b: Booking): string {
    return b.estimatedStartAt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getElapsed(start?: Date): string {
    if (!start) return '0 min';
    const mins = Math.floor((Date.now() - start.getTime()) / 60000);
    return `${mins} min`;
  }
}
