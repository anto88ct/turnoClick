import { Component, inject, signal, computed } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, moveItemInArray } from '@angular/cdk/drag-drop';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcBadgeComponent } from '../../shared/tc-badge/tc-badge.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { Booking, BookingStatus, REQUEST_TYPE_LABELS } from '../../core/models/booking.model';
import { Doctor } from '../../core/models/doctor.model';
import { DoctorStatusType } from '../../core/models/doctor-hub.model';

@Component({
  selector: 'app-live-queue',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, TcBadgeComponent, TcButtonComponent],
  template: `
    <div class="min-h-full bg-slate-50">

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TOPBAR                                                         -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-5 py-3">
        <div class="max-w-screen-xl mx-auto flex items-center justify-between gap-3 flex-wrap">

          <!-- Title + live pill -->
          <div class="flex items-center gap-3">
            <div>
              <h1 class="text-lg font-extrabold text-slate-900 leading-tight">Coda live</h1>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-[11px] font-semibold text-emerald-600">Aggiornamento in tempo reale</span>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Delay buttons -->
            <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span class="text-[11px] font-bold text-slate-500 mr-1">Ritardo:</span>
              @for (d of [5, 10, 15]; track d) {
                <button (click)="addDelay(d)"
                        class="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700
                               hover:bg-amber-200 transition-colors">+{{ d }}'</button>
              }
            </div>

            <!-- Sospendi -->
            <button (click)="toggleSuspend()"
                    [class]="suspended()
                      ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-600'"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                @if (suspended()) {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/>
                } @else {
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                }
              </svg>
              {{ suspended() ? 'Riattiva' : 'Sospendi' }}
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-screen-xl mx-auto px-4 py-5 space-y-6">

        <!-- Suspension banner -->
        @if (suspended()) {
          <div class="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
            <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-extrabold text-rose-800">Prenotazioni sospese</p>
              <p class="text-xs text-rose-600 mt-0.5">I pazienti non possono aggiungersi alla coda in questo momento.</p>
            </div>
          </div>
        }

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- KPI ROW                                                     -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="grid grid-cols-3 gap-3 sm:gap-4">

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-amber-600 leading-none">{{ waitingQueue().length }}</p>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">In attesa</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-blue-600 leading-none">{{ inCorsoQueue().length }}</p>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">In visita</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-emerald-600 leading-none">{{ completedCount() }}</p>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">Completate</p>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- DOCTOR BOARD                                                -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <h2 class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Medici in studio</h2>
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-semibold">{{ activeDoctors().length }} attivi</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            @for (doc of allDoctors(); track doc.id) {
              <div class="bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200"
                   [class]="getDoctorCardBorder(doc.id)">

                <!-- Card header: doctor info + status -->
                <div class="px-4 pt-4 pb-3 flex items-start gap-3">
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <img [src]="doc.photoUrl" [alt]="doc.name"
                         class="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
                         [class.grayscale]="getDoctorStatusType(doc.id) === 'assente'">
                    <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                          [class]="getDoctorStatusDot(doc.id)"></span>
                  </div>

                  <!-- Name + specialty + room -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-extrabold text-slate-900 leading-tight truncate">{{ doc.name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ doc.specialty }}</p>
                    <div class="flex items-center gap-1.5 mt-1.5">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        {{ doc.room ?? 'N/D' }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                            [class]="getDoctorStatusBadge(doc.id)">
                        {{ getDoctorStatusLabel(doc.id) }}
                      </span>
                    </div>
                  </div>

                  <!-- Elapsed time -->
                  @if (getDoctorStatusType(doc.id) === 'in_visita') {
                    <div class="flex-shrink-0 text-right">
                      <p class="text-xs font-extrabold text-amber-600">{{ getDoctorElapsed(doc.id) }}</p>
                      <p class="text-[10px] text-slate-400">in corso</p>
                    </div>
                  }
                </div>

                <!-- Current patient row (if in visita) -->
                @if (getDoctorStatusType(doc.id) === 'in_visita') {
                  <div class="mx-3 mb-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800 text-xs font-extrabold">
                      👤
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-amber-500 font-bold uppercase tracking-wide leading-none">In visita ora</p>
                      <p class="text-sm font-extrabold text-amber-900 leading-tight truncate mt-0.5">
                        {{ getDoctorStatus(doc.id)?.patientName ?? '—' }}
                      </p>
                    </div>
                  </div>
                }

                <!-- Next patient row -->
                @if (getNextPatientForDoctor(doc.id); as next) {
                  <div class="mx-3 mb-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <div class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                    <div class="min-w-0 flex-1">
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-none">Prossimo</p>
                      <p class="text-xs font-bold text-slate-700 truncate">{{ next.patientName }}</p>
                    </div>
                    <p class="text-[10px] font-bold text-slate-500 flex-shrink-0">{{ getTime(next.estimatedStartAt) }}</p>
                  </div>
                }

                <!-- Waiting count for doctor -->
                @if (getWaitingCountForDoctor(doc.id) > 0) {
                  <div class="mx-3 mb-3 flex items-center gap-1.5">
                    <div class="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div class="h-full rounded-full bg-amber-400 transition-all"
                           [style.width]="getQueueBarWidth(doc.id)"></div>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400">{{ getWaitingCountForDoctor(doc.id) }} in coda</span>
                  </div>
                } @else if (getDoctorStatusType(doc.id) !== 'assente') {
                  <div class="mx-3 mb-3">
                    <p class="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Coda libera
                    </p>
                  </div>
                }

                <!-- Quick actions -->
                @if (getDoctorStatusType(doc.id) !== 'assente') {
                  <div class="px-3 pb-3 flex gap-2">
                    <button (click)="callNextForDoctor(doc.id)"
                            [disabled]="getWaitingCountForDoctor(doc.id) === 0"
                            class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200">
                      📣 Chiama prossimo
                    </button>
                    <button (click)="setDoctorFree(doc.id)"
                            class="px-3 py-2 rounded-xl text-xs font-bold transition-all
                                   bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                      Libero
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- IN ATTESA — drag-drop list                                  -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <h2 class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Coda d'attesa</h2>
            <div class="flex-1 h-px bg-slate-200"></div>
            @if (waitingQueue().length > 0) {
              <span class="text-xs text-slate-400 font-semibold">trascina per riordinare</span>
            }
          </div>

          @if (waitingQueue().length === 0) {
            <div class="bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center py-12 text-center">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <svg class="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p class="font-bold text-slate-400">Nessun paziente in attesa</p>
              <p class="text-xs text-slate-300 mt-1">La coda è vuota per ora</p>
            </div>
          } @else {
            <div cdkDropList
                 [cdkDropListData]="localWaiting()"
                 (cdkDropListDropped)="onDrop($event)"
                 class="space-y-2">
              @for (b of localWaiting(); track b.id; let i = $index) {
                <div cdkDrag [cdkDragData]="b"
                     class="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200
                            hover:shadow-md transition-all duration-200 overflow-hidden
                            cursor-grab active:cursor-grabbing">
                  <div cdkDragPlaceholder
                       class="h-20 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl"></div>

                  <div class="flex items-center gap-0">

                    <!-- Position + drag handle -->
                    <div class="flex flex-col items-center justify-center gap-1 w-14 py-4 border-r border-slate-100 flex-shrink-0">
                      <div cdkDragHandle class="text-slate-300 hover:text-indigo-400 transition-colors cursor-grab">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                        </svg>
                      </div>
                      <div class="w-7 h-7 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-700 text-xs font-extrabold
                                  flex items-center justify-center">
                        {{ i + 1 }}
                      </div>
                    </div>

                    <!-- Patient info -->
                    <div class="flex-1 min-w-0 px-4 py-3">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p class="font-extrabold text-slate-900 text-sm truncate">{{ b.patientName }}</p>
                          <p class="text-xs text-slate-500 mt-0.5">{{ getRequestLabel(b) }}</p>
                        </div>
                        <div class="flex-shrink-0 text-right">
                          <p class="text-xs font-extrabold text-slate-700">{{ getTime(b.estimatedStartAt) }}</p>
                          <p class="text-[10px] text-slate-400">stimato</p>
                        </div>
                      </div>
                      <div class="flex items-center justify-between mt-2.5">
                        <div class="flex items-center gap-1.5">
                          <img [src]="getDoctorPhoto(b.doctorId)" [alt]="b.doctorName"
                               class="w-5 h-5 rounded-full object-cover">
                          <span class="text-xs text-slate-500 font-semibold">{{ b.doctorName }}</span>
                          <span class="text-slate-300 text-xs">·</span>
                          <span class="text-xs text-slate-400">{{ getDoctorRoom(b.doctorId) }}</span>
                        </div>
                        <div class="flex gap-1.5">
                          <button (click)="updateStatus(b.id, 'in_corso')"
                                  class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold
                                         hover:bg-indigo-700 transition-colors">
                            In visita
                          </button>
                          <button (click)="updateStatus(b.id, 'no_show')"
                                  class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold
                                         hover:bg-slate-200 transition-colors">
                            No-show
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COMPLETATE OGGI                                             -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <h2 class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Completate oggi</h2>
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
              {{ completedCount() }}
            </span>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            @if (completedToday().length === 0) {
              <div class="py-10 text-center">
                <p class="text-sm font-semibold text-slate-400">Nessuna visita completata oggi</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200">
                      <th class="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Paziente</th>
                      <th class="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Tipo visita</th>
                      <th class="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Medico</th>
                      <th class="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Orario</th>
                      <th class="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Esito</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (b of completedToday(); track b.id) {
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="py-3 px-4 font-bold text-slate-900">{{ b.patientName }}</td>
                        <td class="py-3 px-4 text-slate-500 hidden sm:table-cell">{{ getRequestLabel(b) }}</td>
                        <td class="py-3 px-4 hidden md:table-cell">
                          <div class="flex items-center gap-2">
                            <img [src]="getDoctorPhoto(b.doctorId)" [alt]="b.doctorName"
                                 class="w-6 h-6 rounded-full object-cover flex-shrink-0">
                            <span class="text-slate-600 text-xs">{{ b.doctorName }}</span>
                          </div>
                        </td>
                        <td class="py-3 px-4 text-slate-500 text-xs font-semibold">{{ getTime(b.completedAt) }}</td>
                        <td class="py-3 px-4">
                          <tc-badge [variant]="b.status" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
})
export class LiveQueueComponent {
  private mockData = inject(MockDataService);

  readonly waitingQueue  = this.mockData.waitingQueue;
  readonly inCorsoQueue  = this.mockData.inCorsoQueue;
  readonly suspended     = this.mockData.suspended;
  readonly allDoctors    = this.mockData.doctors;

  readonly localWaiting  = computed(() => [...this.mockData.waitingQueue()]);

  readonly activeDoctors = computed(() =>
    this.allDoctors().filter(d => this.getDoctorStatusType(d.id) !== 'assente')
  );

  readonly completedToday = computed(() =>
    this.mockData.queue().filter(b =>
      (b.status === 'completata' || b.status === 'no_show') &&
      b.createdAt.toDateString() === new Date().toDateString()
    )
  );

  readonly completedCount = computed(() => this.completedToday().length);

  // ── Status helpers ────────────────────────────────────────────────────────

  getDoctorStatus(docId: string) {
    return this.mockData.getDoctorStatus(docId);
  }

  getDoctorStatusType(docId: string): DoctorStatusType {
    return this.mockData.getDoctorStatus(docId)?.status ?? 'disponibile';
  }

  getDoctorStatusDot(docId: string): string {
    const map: Record<DoctorStatusType, string> = {
      disponibile:  'bg-emerald-400',
      in_visita:    'bg-amber-400',
      quasi_finito: 'bg-orange-400',
      terminato:    'bg-slate-300',
      assente:      'bg-rose-400',
    };
    return map[this.getDoctorStatusType(docId)];
  }

  getDoctorStatusBadge(docId: string): string {
    const map: Record<DoctorStatusType, string> = {
      disponibile:  'bg-emerald-100 text-emerald-700',
      in_visita:    'bg-amber-100 text-amber-700',
      quasi_finito: 'bg-orange-100 text-orange-700',
      terminato:    'bg-slate-100 text-slate-600',
      assente:      'bg-rose-100 text-rose-700',
    };
    return map[this.getDoctorStatusType(docId)];
  }

  getDoctorStatusLabel(docId: string): string {
    const map: Record<DoctorStatusType, string> = {
      disponibile:  'Disponibile',
      in_visita:    'In visita',
      quasi_finito: 'Quasi finito',
      terminato:    'Ha terminato',
      assente:      'Assente',
    };
    return map[this.getDoctorStatusType(docId)];
  }

  getDoctorCardBorder(docId: string): string {
    const map: Record<DoctorStatusType, string> = {
      disponibile:  'border-emerald-200',
      in_visita:    'border-amber-300',
      quasi_finito: 'border-orange-200',
      terminato:    'border-slate-200',
      assente:      'border-slate-200 opacity-60',
    };
    return map[this.getDoctorStatusType(docId)];
  }

  getDoctorElapsed(docId: string): string {
    const st = this.mockData.getDoctorStatus(docId);
    if (!st?.updatedAt) return '';
    const mins = Math.floor((Date.now() - st.updatedAt.getTime()) / 60000);
    return `${mins} min`;
  }

  getNextPatientForDoctor(docId: string): Booking | undefined {
    return this.waitingQueue().find(b => b.doctorId === docId);
  }

  getWaitingCountForDoctor(docId: string): number {
    return this.waitingQueue().filter(b => b.doctorId === docId).length;
  }

  getQueueBarWidth(docId: string): string {
    const count = this.getWaitingCountForDoctor(docId);
    const maxVisible = 8;
    return `${Math.min(100, (count / maxVisible) * 100)}%`;
  }

  getDoctorPhoto(docId: string): string {
    return this.allDoctors().find(d => d.id === docId)?.photoUrl ?? '';
  }

  getDoctorRoom(docId: string): string {
    return this.allDoctors().find(d => d.id === docId)?.room ?? '';
  }

  // ── Quick actions ─────────────────────────────────────────────────────────

  callNextForDoctor(docId: string): void {
    const next = this.waitingQueue().find(b => b.doctorId === docId);
    if (next) this.mockData.updateStatus(next.id, 'in_corso');
  }

  setDoctorFree(docId: string): void {
    this.mockData.setDoctorStatus(docId, 'disponibile');
  }

  updateStatus(id: string, status: BookingStatus): void {
    this.mockData.updateStatus(id, status);
  }

  toggleSuspend(): void { this.mockData.toggleSuspended(); }
  addDelay(minutes: number): void { this.mockData.addGlobalDelay(minutes); }

  onDrop(event: CdkDragDrop<Booking[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.mockData.reorderWaiting(event.previousIndex, event.currentIndex);
    }
  }

  // ── Formatting ────────────────────────────────────────────────────────────

  getRequestLabel(b: Booking): string { return REQUEST_TYPE_LABELS[b.requestType]; }

  getTime(date?: Date): string {
    if (!date) return '—';
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
