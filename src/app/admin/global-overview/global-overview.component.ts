import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcStatCardComponent } from '../../shared/tc-stat-card/tc-stat-card.component';
import { TcBadgeComponent } from '../../shared/tc-badge/tc-badge.component';

const MONTHLY_DATA = [
  { month: 'Nov', studios: 52 },
  { month: 'Dic', studios: 61 },
  { month: 'Gen', studios: 74 },
  { month: 'Feb', studios: 83 },
  { month: 'Mar', studios: 98 },
  { month: 'Apr', studios: 112 },
  { month: 'Mag', studios: 127 },
];

@Component({
  selector: 'app-global-overview',
  standalone: true,
  imports: [RouterLink, TcStatCardComponent, TcBadgeComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <div class="mb-6">
        <h1 class="page-header">Panoramica globale</h1>
        <p class="page-subheader">Stato della piattaforma TurnoClick in tempo reale</p>
      </div>

      <!-- Global stats -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <tc-stat-card label="Studi attivi" [value]="stats().activeStudios" sub="Abbonamenti attivi" iconBg="bg-tc-50" [trend]="18">
          <svg icon class="w-5 h-5 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Code attive" [value]="stats().activeQueues" sub="In questo momento" iconBg="bg-blue-50" valueColor="text-blue-600">
          <svg icon class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="SMS oggi" [value]="stats().smsSentToday.toLocaleString('it-IT')" sub="Notifiche inviate" iconBg="bg-purple-50" valueColor="text-purple-600" [trend]="7">
          <svg icon class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Prenotazioni oggi" [value]="stats().totalBookingsToday" sub="Tutte le piattaforme" iconBg="bg-amber-50" valueColor="text-amber-600">
          <svg icon class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Prenotazioni mese" [value]="stats().totalBookingsMonth.toLocaleString('it-IT')" sub="Maggio 2026" iconBg="bg-tc-50" valueColor="text-tc-600" [trend]="22">
          <svg icon class="w-5 h-5 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </tc-stat-card>

        <tc-stat-card label="Revenue mensile" [value]="'€ ' + stats().monthlyRevenue.toLocaleString('it-IT')" sub="MRR stimato" iconBg="bg-tc-50" valueColor="text-tc-700" [trend]="15">
          <svg icon class="w-5 h-5 text-tc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </tc-stat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Growth chart -->
        <div class="lg:col-span-2 dashboard-card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="font-extrabold text-slate-900">Crescita studi attivi</h2>
              <p class="text-xs text-slate-400 mt-0.5">Ultimi 7 mesi</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-extrabold text-tc-600">+{{ stats().newStudiosThisMonth }}</p>
              <p class="text-xs text-slate-400">nuovi questo mese</p>
            </div>
          </div>
          <div class="flex items-end gap-3 h-36">
            @for (d of monthlyData; track d.month) {
              <div class="flex flex-col items-center flex-1 gap-1">
                <span class="text-xs font-bold text-slate-600">{{ d.studios }}</span>
                <div
                  class="w-full rounded-t-lg transition-all duration-700"
                  [class]="$last ? 'bg-tc-500' : 'bg-tc-200'"
                  [style.height.%]="d.studios / 130 * 100"
                  [style.min-height]="'8px'"
                ></div>
                <span class="text-[10px] text-slate-400 font-semibold">{{ d.month }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Plan distribution -->
        <div class="dashboard-card">
          <h2 class="font-extrabold text-slate-900 mb-4">Distribuzione piani</h2>
          <div class="flex flex-col gap-3">
            @for (item of planDistribution(); track item.label) {
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-semibold text-slate-600">{{ item.label }}</span>
                  <span class="text-sm font-extrabold text-slate-900">{{ item.count }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full transition-all duration-700"
                       [class]="item.barColor"
                       [style.width.%]="item.count / totalStudios() * 100"></div>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 pt-4 border-t border-tc-border/60">
            <a routerLink="/admin/clienti"
               class="text-sm font-bold text-tc-600 hover:text-tc-700 transition-colors">
              Gestisci tutti gli studi →
            </a>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="dashboard-card mt-5">
        <h2 class="font-extrabold text-slate-900 mb-4">Attività recente</h2>
        <div class="flex flex-col gap-0">
          @for (event of recentActivity; track event.time) {
            <div class="flex items-start gap-3 py-3 border-b border-tc-border/50 last:border-0">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                   [class]="event.bgColor">
                {{ event.icon }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-800">{{ event.text }}</p>
                <p class="text-xs text-slate-400">{{ event.time }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class GlobalOverviewComponent {
  private mockData = inject(MockDataService);
  readonly stats = this.mockData.globalStats;
  readonly monthlyData = MONTHLY_DATA;

  readonly totalStudios = computed(() => this.mockData.studios().length);

  readonly planDistribution = computed(() => {
    const studios = this.mockData.studios();
    return [
      { label: 'Business',     count: studios.filter(s => s.plan === 'business').length,     barColor: 'bg-slate-700' },
      { label: 'Professional', count: studios.filter(s => s.plan === 'professional').length, barColor: 'bg-tc-600' },
      { label: 'Starter',      count: studios.filter(s => s.plan === 'starter').length,      barColor: 'bg-tc-400' },
      { label: 'Free',         count: studios.filter(s => s.plan === 'free').length,         barColor: 'bg-slate-300' },
    ];
  });

  readonly recentActivity = [
    { icon: '🏥', text: 'Studio Legale Ferretti & Associati ha iniziato la prova gratuita', time: '5 minuti fa', bgColor: 'bg-amber-50' },
    { icon: '💳', text: 'Poliambulatorio Milano Centro ha rinnovato il piano Business', time: '2 ore fa', bgColor: 'bg-tc-50' },
    { icon: '📱', text: '847 SMS inviati nelle ultime 24 ore — limite mensile al 28%', time: '3 ore fa', bgColor: 'bg-blue-50' },
    { icon: '⚠️', text: 'Studio Dentistico Romano è in stato sospeso da 89 giorni', time: '1 giorno fa', bgColor: 'bg-rose-50' },
    { icon: '✅', text: 'Centro Estetico Luna ha aggiornato gli orari di apertura', time: '2 giorni fa', bgColor: 'bg-tc-50' },
  ];
}
