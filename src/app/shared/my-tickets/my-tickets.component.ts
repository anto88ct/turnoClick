import { Component, inject, signal, computed } from '@angular/core';
import { HelpTicketService } from '../../core/services/help-ticket.service';
import {
  SupportTicket, TicketStatus,
  TICKET_STATUS_LABELS, TICKET_STATUS_COLORS,
} from '../../core/models/ticket.model';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      <div>
        <h1 class="text-xl font-extrabold text-slate-900">I Miei Ticket</h1>
        <p class="text-sm text-slate-500 mt-0.5">Storico delle richieste di supporto aperte con TurnoClick.</p>
      </div>

      @if (tickets().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <p class="text-slate-500 font-semibold text-sm">Nessun ticket aperto</p>
          <p class="text-slate-400 text-xs mt-1">Usa il widget "Hai bisogno d'aiuto?" in basso a destra per aprire un ticket.</p>
        </div>
      }

      <div class="space-y-3">
        @for (t of tickets(); track t.id) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-5">
              <div class="flex items-start gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap mb-2">
                    <span class="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                      {{ t.id }}
                    </span>
                    <span class="text-xs font-extrabold px-2.5 py-1 rounded-full" [class]="statusColor(t.status)">
                      {{ statusLabel(t.status) }}
                    </span>
                    @if (t.assignedTo) {
                      <span class="text-xs text-slate-400 font-medium">Assegnato a: <strong>{{ operatorName(t.assignedTo) }}</strong></span>
                    }
                  </div>
                  <p class="text-sm font-semibold text-slate-800 line-clamp-2">{{ t.description }}</p>
                  <p class="text-xs text-slate-400 mt-2">
                    Aperto il {{ formatDate(t.createdAt) }}
                    @if (t.updatedAt !== t.createdAt) {
                      · Aggiornato {{ formatDate(t.updatedAt) }}
                    }
                  </p>
                </div>
                <!-- Status indicator dot -->
                <div class="flex-shrink-0 mt-1">
                  <div class="w-2.5 h-2.5 rounded-full"
                       [class]="t.status === 'chiuso' ? 'bg-emerald-400' :
                                t.status === 'in_corso' ? 'bg-amber-400 animate-pulse' :
                                t.status === 'in_attesa_riscontro' ? 'bg-blue-400' : 'bg-rose-400 animate-pulse'">
                  </div>
                </div>
              </div>

              <!-- Progress steps -->
              <div class="mt-4 flex items-center gap-1">
                @for (step of statusSteps; track step.id) {
                  <div class="flex items-center gap-1 flex-1">
                    <div class="h-1.5 rounded-full flex-1 transition-all duration-500"
                         [class]="isStepDone(t.status, step.id) ? 'bg-tc-400' : 'bg-slate-100'"></div>
                    @if ($last) {
                      <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                           [class]="t.status === 'chiuso' ? 'bg-emerald-400' : 'bg-slate-200'"></div>
                    }
                  </div>
                }
              </div>
              <div class="flex justify-between mt-1.5">
                @for (step of statusSteps; track step.id) {
                  <span class="text-[9px] font-bold"
                        [class]="t.status === step.id ? 'text-tc-600' : 'text-slate-300'">
                    {{ step.label }}
                  </span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MyTicketsComponent {
  private ticketSvc = inject(HelpTicketService);

  readonly tickets = computed(() => this.ticketSvc.getByStudio('studio-demo'));

  readonly statusSteps: { id: TicketStatus; label: string }[] = [
    { id: 'aperto',               label: 'Aperto' },
    { id: 'in_corso',             label: 'In corso' },
    { id: 'in_attesa_riscontro',  label: 'In attesa' },
    { id: 'chiuso',               label: 'Chiuso' },
  ];

  statusLabel(s: TicketStatus): string { return TICKET_STATUS_LABELS[s]; }
  statusColor(s: TicketStatus): string { return TICKET_STATUS_COLORS[s]; }

  operatorName(id: string): string {
    return id === 'nicolo' ? 'Nicolò C.' : id === 'antonio' ? 'Antonio D.' : id;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  isStepDone(current: TicketStatus, step: TicketStatus): boolean {
    const order: TicketStatus[] = ['aperto', 'in_corso', 'in_attesa_riscontro', 'chiuso'];
    return order.indexOf(current) >= order.indexOf(step);
  }
}
