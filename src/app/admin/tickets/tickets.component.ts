import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpTicketService } from '../../core/services/help-ticket.service';
import {
  SupportTicket, TicketStatus,
  TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_OPERATORS,
} from '../../core/models/ticket.model';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">Gestione Ticket</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ filtered().length }} ticket · {{ openCount() }} aperti · {{ closedCount() }} chiusi
          </p>
        </div>
        <!-- Summary pills -->
        <div class="flex gap-2 flex-wrap">
          @for (s of statusList; track s.id) {
            <button (click)="filterStatus.set(filterStatus() === s.id ? '' : s.id)"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all"
                    [class]="filterStatus() === s.id ? s.activeClass : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
              {{ s.label }} ({{ countByStatus(s.id) }})
            </button>
          }
        </div>
      </div>

      @if (tickets().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <p class="text-slate-500 font-semibold">Nessun ticket ricevuto</p>
          <p class="text-slate-400 text-xs mt-1">I ticket aperti dai clienti appariranno qui.</p>
        </div>
      }

      <!-- Ticket list -->
      <div class="space-y-3">
        @for (t of filtered(); track t.id) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <!-- Header row -->
            <div class="flex items-start gap-4 p-5">
              <!-- Status dot -->
              <div class="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                   [class]="t.status === 'chiuso' ? 'bg-emerald-400' :
                            t.status === 'in_corso' ? 'bg-amber-400 animate-pulse' :
                            t.status === 'in_attesa_riscontro' ? 'bg-blue-400' : 'bg-rose-400 animate-pulse'">
              </div>

              <div class="flex-1 min-w-0">
                <!-- Ticket meta -->
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <span class="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{{ t.id }}</span>
                  <span class="text-xs font-extrabold px-2.5 py-1 rounded-full" [class]="statusColor(t.status)">
                    {{ statusLabel(t.status) }}
                  </span>
                  <span class="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {{ t.studioName }}
                  </span>
                </div>
                <!-- Description -->
                <p class="text-sm font-semibold text-slate-800 mb-2">{{ t.description }}</p>
                <!-- Contact info -->
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>📧 {{ t.email }}</span>
                  <span>📞 {{ t.phone }}</span>
                  @if (t.extraPhone) { <span>📞 {{ t.extraPhone }}</span> }
                  @if (t.contactName) { <span>👤 {{ t.contactName }}</span> }
                  <span>🕐 {{ formatDate(t.createdAt) }}</span>
                </div>
              </div>

              <!-- Expand toggle -->
              <button (click)="toggleExpand(t.id)"
                      class="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <svg class="w-4 h-4 text-slate-500 transition-transform"
                     [class]="expanded() === t.id ? 'rotate-180' : ''"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <!-- Expanded management area -->
            @if (expanded() === t.id) {
              <div class="border-t border-slate-100 p-5 bg-slate-50 space-y-4">

                <!-- Status + Assignee selectors -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Stato ticket</label>
                    <select [value]="t.status"
                            (change)="updateStatus(t.id, $any($event.target).value)"
                            class="tc-select w-full">
                      @for (s of statusList; track s.id) {
                        <option [value]="s.id">{{ s.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Assegna operatore</label>
                    <select [value]="t.assignedTo ?? ''"
                            (change)="updateAssignee(t.id, $any($event.target).value)"
                            class="tc-select w-full">
                      <option value="">— Non assegnato —</option>
                      @for (op of operators; track op.id) {
                        <option [value]="op.id">{{ op.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Internal note -->
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Note interne (visibili solo ad Admin)</label>
                  <textarea [value]="t.internalNote ?? ''"
                            (blur)="saveNote(t.id, $any($event.target).value)"
                            rows="2" placeholder="Aggiungi una nota interna..."
                            class="tc-input-sm w-full resize-none text-xs"></textarea>
                </div>

                <!-- Quick actions -->
                <div class="flex gap-2 flex-wrap">
                  <button (click)="updateStatus(t.id, 'chiuso')"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                    ✓ Chiudi ticket
                  </button>
                  <button (click)="updateStatus(t.id, 'in_corso')"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                    ▶ Segna "In corso"
                  </button>
                  <button (click)="updateStatus(t.id, 'in_attesa_riscontro')"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                    ⏳ In attesa riscontro
                  </button>
                </div>

                <p class="text-xs text-slate-400">
                  Aggiornato: {{ formatDate(t.updatedAt) }}
                  @if (t.assignedTo) { · Assegnato a: <strong>{{ operatorName(t.assignedTo) }}</strong> }
                </p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminTicketsComponent {
  private svc = inject(HelpTicketService);

  readonly tickets     = this.svc.tickets;
  readonly filterStatus = signal<string>('');
  readonly expanded    = signal<string | null>(null);
  readonly operators   = TICKET_OPERATORS;

  readonly statusList = [
    { id: 'aperto'              as TicketStatus, label: 'Aperto',              activeClass: 'bg-rose-100 text-rose-700' },
    { id: 'in_corso'            as TicketStatus, label: 'In corso',            activeClass: 'bg-amber-100 text-amber-700' },
    { id: 'in_attesa_riscontro' as TicketStatus, label: 'In attesa',           activeClass: 'bg-blue-100 text-blue-700' },
    { id: 'chiuso'              as TicketStatus, label: 'Chiuso',              activeClass: 'bg-emerald-100 text-emerald-700' },
  ];

  readonly filtered = computed(() => {
    const f = this.filterStatus();
    return f ? this.tickets().filter(t => t.status === f) : this.tickets();
  });

  readonly openCount   = computed(() => this.tickets().filter(t => t.status !== 'chiuso').length);
  readonly closedCount = computed(() => this.tickets().filter(t => t.status === 'chiuso').length);

  countByStatus(s: TicketStatus): number { return this.tickets().filter(t => t.status === s).length; }
  statusLabel(s: TicketStatus): string   { return TICKET_STATUS_LABELS[s]; }
  statusColor(s: TicketStatus): string   { return TICKET_STATUS_COLORS[s]; }
  operatorName(id: string): string       { return TICKET_OPERATORS.find(o => o.id === id)?.name ?? id; }

  toggleExpand(id: string): void {
    this.expanded.update(v => v === id ? null : id);
  }

  updateStatus(id: string, status: string): void {
    this.svc.updateStatus(id, status as TicketStatus);
  }

  updateAssignee(id: string, opId: string): void {
    this.svc.assignOperator(id, opId);
  }

  saveNote(id: string, note: string): void {
    this.svc.setInternalNote(id, note);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
}
