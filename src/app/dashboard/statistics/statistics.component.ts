import { Component, inject, computed } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcStatCardComponent } from '../../shared/tc-stat-card/tc-stat-card.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [TcStatCardComponent, TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="page-header">Statistiche giornaliere</h1>
          <p class="page-subheader">{{ today }} — Studio Medico Dott. Rossi</p>
        </div>
        <tc-button variant="outline" (clicked)="exportCsv()">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Esporta CSV
        </tc-button>
      </div>

      <!-- Stat grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <tc-stat-card
          label="Totale prenotazioni"
          [value]="stats().totalBookings"
          sub="Oggi"
          iconBg="bg-slate-100"
          [trend]="8"
        >
          <svg icon class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card
          label="Tasso no-show"
          [value]="stats().noShowRate + '%'"
          sub="{{ stats().noShow }} pazienti"
          iconBg="bg-rose-50"
          valueColor="text-rose-500"
          [trend]="-2"
        >
          <svg icon class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card
          label="Attesa media"
          [value]="stats().avgWaitMinutes + ' min'"
          sub="Dal check-in all'inizio"
          iconBg="bg-amber-50"
          valueColor="text-amber-600"
          [trend]="-5"
        >
          <svg icon class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card
          label="Visita media"
          [value]="stats().avgVisitMinutes + ' min'"
          sub="Durata per paziente"
          iconBg="bg-purple-50"
          valueColor="text-purple-600"
        >
          <svg icon class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
        </tc-stat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Bar chart -->
        <div class="lg:col-span-2 dashboard-card">
          <h2 class="font-extrabold text-slate-900 mb-1">Prenotazioni per fascia oraria</h2>
          <p class="text-xs text-slate-400 mb-5">Distribuzione delle prenotazioni durante la giornata</p>

          <div class="flex items-end gap-2 h-40">
            @for (bar of stats().hourlyData; track bar.hour) {
              <div class="flex flex-col items-center flex-1 gap-1">
                <span class="text-xs font-bold text-slate-600">{{ bar.count }}</span>
                <div
                  class="w-full rounded-t-lg bg-gradient-to-t from-tc-600 to-tc-400 transition-all duration-700"
                  [style.height.%]="bar.count / maxCount() * 100"
                  [style.min-height]="'4px'"
                ></div>
                <span class="text-[10px] text-slate-400 font-semibold whitespace-nowrap">{{ bar.label }}</span>
              </div>
            }
          </div>

          <!-- Peak hour info -->
          <div class="mt-4 flex items-center gap-2 text-sm">
            <span class="w-3 h-3 rounded-full bg-tc-500 flex-shrink-0"></span>
            <p class="text-slate-600">
              Fascia più affollata: <strong class="text-slate-900">10:00–11:00</strong>
              con <strong class="text-slate-900">14 prenotazioni</strong>
            </p>
          </div>
        </div>

        <!-- Status breakdown -->
        <div class="dashboard-card">
          <h2 class="font-extrabold text-slate-900 mb-4">Distribuzione stati</h2>

          <div class="flex flex-col gap-3">
            @for (item of statusItems(); track item.label) {
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-semibold text-slate-600">{{ item.label }}</span>
                  <span class="text-sm font-extrabold text-slate-900">{{ item.count }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    class="h-2.5 rounded-full transition-all duration-700"
                    [class]="item.barColor"
                    [style.width.%]="stats().totalBookings > 0 ? (item.count / stats().totalBookings * 100) : 0"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- By doctor -->
      <div class="dashboard-card mt-5">
        <h2 class="font-extrabold text-slate-900 mb-4">Prestazioni per medico</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-tc-border">
                <th class="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Medico</th>
                <th class="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialità</th>
                <th class="text-right py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Visite</th>
                <th class="text-right py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Attesa media</th>
                <th class="text-right py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Durata media</th>
              </tr>
            </thead>
            <tbody>
              @for (doc of doctorStats(); track doc.id) {
                <tr class="border-b border-tc-border/50 hover:bg-tc-50/50 transition-colors">
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2.5">
                      <img [src]="doc.photoUrl" alt="" class="w-7 h-7 rounded-full object-cover"/>
                      <span class="font-semibold text-slate-900">{{ doc.name }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-500">{{ doc.specialty }}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-900">{{ doc.visits }}</td>
                  <td class="py-2.5 px-3 text-right text-slate-600">{{ doc.avgWait }} min</td>
                  <td class="py-2.5 px-3 text-right text-slate-600">{{ doc.avgDuration }} min</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class StatisticsComponent {
  private mockData = inject(MockDataService);
  readonly stats = this.mockData.dailyStats;

  get today(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long',
    }).replace(/^\w/, c => c.toUpperCase());
  }

  maxCount = computed(() =>
    Math.max(...this.mockData.dailyStats().hourlyData.map(h => h.count), 1)
  );

  statusItems = computed(() => {
    const s = this.stats();
    return [
      { label: 'Completate',  count: s.completate, barColor: 'bg-tc-500' },
      { label: 'In attesa',   count: s.inAttesa,   barColor: 'bg-amber-400' },
      { label: 'In visita',   count: s.inCorso,    barColor: 'bg-blue-400' },
      { label: 'No-show',     count: s.noShow,     barColor: 'bg-rose-400' },
      { label: 'Annullate',   count: s.annullate,  barColor: 'bg-slate-300' },
    ];
  });

  doctorStats = computed(() =>
    this.mockData.doctors().filter(d => d.available).map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      photoUrl: d.photoUrl,
      visits: Math.floor(Math.random() * 8 + 3),
      avgWait: Math.floor(Math.random() * 8 + 8),
      avgDuration: d.avgVisitMinutes,
    }))
  );

  exportCsv(): void {
    const rows = [
      ['Codice', 'Paziente', 'Medico', 'Tipo', 'Stato', 'Creato alle'],
      ...this.mockData.queue()
        .filter(b => b.createdAt.toDateString() === new Date().toDateString())
        .map(b => [
          b.id, b.patientName, b.doctorName, b.requestType, b.status,
          b.createdAt.toLocaleTimeString('it-IT'),
        ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnoclick-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
