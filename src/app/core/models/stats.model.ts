export interface HourlyData {
  hour: number;
  label: string;
  count: number;
}

export interface DailyStats {
  totalBookings: number;
  inAttesa: number;
  inCorso: number;
  completate: number;
  annullate: number;
  noShow: number;
  avgWaitMinutes: number;
  avgVisitMinutes: number;
  noShowRate: number;
  hourlyData: HourlyData[];
}

export interface GlobalStats {
  activeStudios: number;
  activeQueues: number;
  smsSentToday: number;
  totalBookingsToday: number;
  totalBookingsMonth: number;
  newStudiosThisMonth: number;
  monthlyRevenue: number;
}
