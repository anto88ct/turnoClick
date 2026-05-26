import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Booking, BookingStatus, REQUEST_TYPE_LABELS, STATUS_LABELS } from '../../core/models/booking.model';
import { TcBadgeComponent } from '../../shared/tc-badge/tc-badge.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [FormsModule, TcBadgeComponent, TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <div class="mb-6">
        <h1 class="page-header">Archivio storico</h1>
        <p class="page-subheader">Storico completo delle prenotazioni filtrabili</p>
      </div>

      <!-- Filters -->
      <div class="dashboard-card mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Cerca</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                class="tc-input-sm pl-9"
                placeholder="Nome, codice, telefono..."
                [(ngModel)]="searchQuery"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Data</label>
            <input type="date" class="tc-select" [(ngModel)]="filterDate"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Stato</label>
            <select class="tc-select" [(ngModel)]="filterStatus">
              <option value="">Tutti gli stati</option>
              <option value="completata">Completata</option>
              <option value="annullata">Annullata</option>
              <option value="no_show">No-show</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Medico</label>
            <select class="tc-select" [(ngModel)]="filterDoctor">
              <option value="">Tutti i medici</option>
              @for (doc of doctors(); track doc.id) {
                <option [value]="doc.id">{{ doc.name }}</option>
              }
            </select>
          </div>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-tc-border/60">
          <p class="text-xs text-slate-500 font-semibold">
            {{ filtered().length }} prenotazioni trovate
          </p>
          <tc-button variant="ghost" size="sm" (clicked)="clearFilters()">
            Cancella filtri
          </tc-button>
        </div>
      </div>

      <!-- Table -->
      <div class="dashboard-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-tc-border bg-slate-50/50">
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Codice</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Paziente</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Medico</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Data</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stato</th>
                <th class="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              @for (b of paginated(); track b.id) {
                <tr
                  class="border-b border-tc-border/50 hover:bg-tc-50/50 cursor-pointer transition-colors"
                  (click)="openDetail(b)"
                >
                  <td class="py-3 px-4 font-mono text-xs font-bold text-tc-700">{{ b.id }}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">{{ b.patientName }}</td>
                  <td class="py-3 px-4 text-slate-600 hidden md:table-cell">{{ requestLabel(b) }}</td>
                  <td class="py-3 px-4 text-slate-600 hidden lg:table-cell">{{ b.doctorName }}</td>
                  <td class="py-3 px-4 text-slate-500 hidden sm:table-cell">{{ formatDate(b.createdAt) }}</td>
                  <td class="py-3 px-4">
                    <tc-badge [variant]="b.status" />
                  </td>
                  <td class="py-3 px-4 text-slate-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-12 text-slate-400">
                    <svg class="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                    </svg>
                    <p class="font-semibold">Nessuna prenotazione trovata</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-tc-border/60">
            <p class="text-xs text-slate-500">
              Pagina {{ currentPage() }} di {{ totalPages() }}
            </p>
            <div class="flex gap-1">
              <tc-button size="sm" variant="ghost" [disabled]="currentPage() === 1"
                         (clicked)="prevPage()">← Indietro</tc-button>
              <tc-button size="sm" variant="ghost" [disabled]="currentPage() === totalPages()"
                         (clicked)="nextPage()">Avanti →</tc-button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Detail modal -->
    @if (selectedBooking()) {
      <div class="fixed inset-0 z-50 flex" (click)="selectedBooking.set(null)">
        <div class="flex-1 bg-black/40 backdrop-blur-sm"></div>
        <div class="w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-up"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-5 border-b border-tc-border">
            <h2 class="font-extrabold text-slate-900">Dettaglio prenotazione</h2>
            <button (click)="selectedBooking.set(null)"
                    class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600
                           hover:bg-slate-200 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-5">
            <!-- Code + status -->
            <div class="flex items-center justify-between">
              <span class="font-mono text-2xl font-extrabold text-tc-700">
                {{ selectedBooking()!.id }}
              </span>
              <tc-badge [variant]="selectedBooking()!.status" />
            </div>

            <!-- Patient info -->
            <div class="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Paziente</p>
                <p class="font-bold text-slate-900">{{ selectedBooking()!.patientName }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Telefono</p>
                <p class="font-medium text-slate-700">{{ selectedBooking()!.phone }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tipo visita</p>
                <p class="font-medium text-slate-700">{{ requestLabel(selectedBooking()!) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Medico</p>
                <p class="font-medium text-slate-700">{{ selectedBooking()!.doctorName }}</p>
              </div>
            </div>

            <!-- Note -->
            @if (selectedBooking()!.internalNote) {
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p class="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Nota interna</p>
                <p class="text-sm text-amber-800">{{ selectedBooking()!.internalNote }}</p>
              </div>
            }

            <!-- Event log -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Log eventi</p>
              <div class="flex flex-col gap-0">
                @for (event of getEventLog(selectedBooking()!); track event.label) {
                  <div class="flex items-start gap-3">
                    <div class="flex flex-col items-center">
                      <div class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                           [class]="event.dotColor"></div>
                      @if (!$last) {
                        <div class="w-0.5 flex-1 bg-slate-200 my-1"></div>
                      }
                    </div>
                    <div class="pb-4 flex-1">
                      <p class="text-sm font-semibold text-slate-800">{{ event.label }}</p>
                      <p class="text-xs text-slate-400">{{ event.time }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ArchiveComponent {
  private mockData = inject(MockDataService);

  searchQuery = '';
  filterDate = '';
  filterStatus = '';
  filterDoctor = '';
  currentPage = signal(1);
  readonly perPage = 15;

  readonly selectedBooking = signal<Booking | null>(null);
  readonly doctors = this.mockData.doctors;

  readonly filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.mockData.historyBookings().filter(b => {
      if (q && !b.patientName.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q) && !b.phone.includes(q)) return false;
      if (this.filterStatus && b.status !== this.filterStatus) return false;
      if (this.filterDoctor && b.doctorId !== this.filterDoctor) return false;
      if (this.filterDate) {
        const filterD = new Date(this.filterDate).toDateString();
        if (b.createdAt.toDateString() !== filterD) return false;
      }
      return true;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage;
    return this.filtered().slice(start, start + this.perPage);
  });

  prevPage(): void { this.currentPage.update(p => p - 1); }
  nextPage(): void { this.currentPage.update(p => p + 1); }

  openDetail(b: Booking): void {
    this.selectedBooking.set(b);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterDate = '';
    this.filterStatus = '';
    this.filterDoctor = '';
    this.currentPage.set(1);
  }

  requestLabel(b: Booking): string {
    return REQUEST_TYPE_LABELS[b.requestType];
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getEventLog(b: Booking): { label: string; time: string; dotColor: string }[] {
    const events: { label: string; time: string; dotColor: string }[] = [
      { label: 'Prenotazione ricevuta', time: this.formatDate(b.createdAt), dotColor: 'bg-slate-400' },
    ];
    if (b.startedAt) {
      events.push({ label: 'Visita iniziata', time: this.formatDate(b.startedAt), dotColor: 'bg-blue-400' });
    }
    if (b.completedAt) {
      events.push({ label: 'Visita completata', time: this.formatDate(b.completedAt), dotColor: 'bg-tc-500' });
    }
    if (b.status === 'no_show') {
      events.push({ label: 'Paziente non presentato (no-show)', time: '—', dotColor: 'bg-rose-400' });
    }
    if (b.status === 'annullata') {
      events.push({ label: 'Prenotazione annullata', time: '—', dotColor: 'bg-rose-400' });
    }
    return events;
  }
}
