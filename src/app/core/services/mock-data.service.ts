import { Injectable, computed, signal } from '@angular/core';
import { Booking, BookingStatus, RequestType } from '../models/booking.model';
import { Doctor } from '../models/doctor.model';
import { Studio } from '../models/studio.model';
import { DailyStats, GlobalStats, HourlyData } from '../models/stats.model';
import { PlanType } from '../models/plan.model';

const NAMES = [
  'Mario Gentile', 'Anna Conti', 'Roberto Ferretti', 'Elena Marini',
  'Giovanni Russo', 'Maria Esposito', 'Paolo Moretti', 'Lucia Ricci',
  'Francesco Bruno', 'Carmela Greco', 'Antonio Mancini', 'Rosa Lombardi',
  'Sergio Testa', 'Giovanna Barbieri', 'Claudio Fabbri', 'Teresa Vitale',
  'Luca Santoro', 'Concetta Martinelli', 'Stefano Gallo', 'Daniela Costa',
];

const REQUEST_TYPES: RequestType[] = [
  'visita', 'ricetta', 'certificato', 'controllo', 'ritiro referti', 'altro',
];

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000);
const minutesAhead = (m: number) => new Date(now.getTime() + m * 60000);

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'dr-rossi',
    name: 'Dott. Marco Rossi',
    specialty: 'Medico di Base',
    photoUrl: 'https://i.pravatar.cc/150?img=12',
    description: 'Medico di medicina generale con 20 anni di esperienza. Specializzato in prevenzione e patologie croniche.',
    avgVisitMinutes: 15,
    rating: 4.8,
    reviewCount: 214,
    available: true,
    studioId: 'studio-demo',
  },
  {
    id: 'dr-bianchi',
    name: 'Dott.ssa Giulia Bianchi',
    specialty: 'Fisioterapista',
    photoUrl: 'https://i.pravatar.cc/150?img=47',
    description: 'Fisioterapista specializzata in riabilitazione sportiva e fisioterapia muscoloscheletrica.',
    avgVisitMinutes: 45,
    rating: 4.9,
    reviewCount: 97,
    available: true,
    studioId: 'studio-demo',
  },
  {
    id: 'dr-ferrari',
    name: 'Dott. Antonio Ferrari',
    specialty: 'Internista',
    photoUrl: 'https://i.pravatar.cc/150?img=33',
    description: 'Specialista in medicina interna e malattie infettive. Consulenze per patologie complesse.',
    avgVisitMinutes: 20,
    rating: 4.7,
    reviewCount: 156,
    available: true,
    studioId: 'studio-demo',
  },
  {
    id: 'dr-romano',
    name: 'Dott.ssa Sofia Romano',
    specialty: 'Dermatologa',
    photoUrl: 'https://i.pravatar.cc/150?img=25',
    description: 'Dermatologa e venerologa. Esperta in diagnostica dermatologica e trattamenti estetici clinici.',
    avgVisitMinutes: 25,
    rating: 4.6,
    reviewCount: 88,
    available: false,
    studioId: 'studio-demo',
  },
  {
    id: 'dr-esposito',
    name: 'Dott. Luca Esposito',
    specialty: 'Cardiologo',
    photoUrl: 'https://i.pravatar.cc/150?img=8',
    description: 'Cardiologo interventista. Ecocardiografie, ECG, Holter. Disponibile su appuntamento.',
    avgVisitMinutes: 30,
    rating: 4.9,
    reviewCount: 203,
    available: true,
    studioId: 'studio-demo',
  },
];

const makeHistory = (): Booking[] => {
  const history: Booking[] = [];
  const statuses: BookingStatus[] = ['completata', 'completata', 'completata', 'no_show', 'annullata'];
  for (let i = 0; i < 42; i++) {
    const daysAgo = Math.floor(i / 6) + 1;
    const doctor = INITIAL_DOCTORS[i % 4];
    const status = statuses[i % 5];
    const created = new Date(now.getTime() - daysAgo * 86400000 - (i % 6) * 3600000);
    history.push({
      id: `TC-H${String(i).padStart(3, '0')}`,
      patientName: NAMES[(i + 3) % NAMES.length],
      phone: `+39 3${String(Math.floor(Math.random() * 89000000 + 10000000))}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      requestType: REQUEST_TYPES[i % REQUEST_TYPES.length],
      status,
      createdAt: created,
      estimatedStartAt: new Date(created.getTime() + 20 * 60000),
      startedAt: status !== 'annullata' ? new Date(created.getTime() + 18 * 60000) : undefined,
      completedAt: status === 'completata' ? new Date(created.getTime() + 35 * 60000) : undefined,
      position: 0,
    });
  }
  return history;
};

const INITIAL_QUEUE: Booking[] = [
  {
    id: 'TC-A3K7',
    patientName: 'Mario Gentile',
    phone: '+39 333 1234567',
    doctorId: 'dr-rossi',
    doctorName: 'Dott. Marco Rossi',
    requestType: 'visita',
    status: 'in_corso',
    createdAt: minutesAgo(25),
    estimatedStartAt: minutesAgo(5),
    startedAt: minutesAgo(7),
    position: 0,
    internalNote: 'Paziente iperteso. Portare ultima misurazione.',
  },
  {
    id: 'TC-B2M9',
    patientName: 'Anna Conti',
    phone: '+39 347 9876543',
    doctorId: 'dr-rossi',
    doctorName: 'Dott. Marco Rossi',
    requestType: 'ricetta',
    status: 'in_attesa',
    createdAt: minutesAgo(18),
    estimatedStartAt: minutesAhead(8),
    position: 1,
  },
  {
    id: 'TC-C4P1',
    patientName: 'Roberto Ferretti',
    phone: '+39 320 5551234',
    doctorId: 'dr-rossi',
    doctorName: 'Dott. Marco Rossi',
    requestType: 'certificato',
    status: 'in_attesa',
    createdAt: minutesAgo(10),
    estimatedStartAt: minutesAhead(23),
    position: 2,
  },
  {
    id: 'TC-D7X3',
    patientName: 'Elena Marini',
    phone: '+39 338 7771234',
    doctorId: 'dr-bianchi',
    doctorName: 'Dott.ssa Giulia Bianchi',
    requestType: 'controllo',
    status: 'in_attesa',
    createdAt: minutesAgo(15),
    estimatedStartAt: minutesAhead(30),
    position: 1,
  },
  {
    id: 'TC-E5R6',
    patientName: 'Giovanni Russo',
    phone: '+39 366 4441234',
    doctorId: 'dr-ferrari',
    doctorName: 'Dott. Antonio Ferrari',
    requestType: 'visita',
    status: 'in_corso',
    createdAt: minutesAgo(35),
    estimatedStartAt: minutesAgo(12),
    startedAt: minutesAgo(12),
    position: 0,
  },
  {
    id: 'TC-F8N4',
    patientName: 'Maria Esposito',
    phone: '+39 329 2221234',
    doctorId: 'dr-ferrari',
    doctorName: 'Dott. Antonio Ferrari',
    requestType: 'ritiro referti',
    status: 'in_attesa',
    createdAt: minutesAgo(8),
    estimatedStartAt: minutesAhead(12),
    position: 1,
  },
  {
    id: 'TC-G1L2',
    patientName: 'Paolo Moretti',
    phone: '+39 351 9991234',
    doctorId: 'dr-esposito',
    doctorName: 'Dott. Luca Esposito',
    requestType: 'visita',
    status: 'in_attesa',
    createdAt: minutesAgo(5),
    estimatedStartAt: minutesAhead(35),
    position: 1,
  },
  {
    id: 'TC-H6T8',
    patientName: 'Lucia Ricci',
    phone: '+39 345 6661234',
    doctorId: 'dr-rossi',
    doctorName: 'Dott. Marco Rossi',
    requestType: 'ricetta',
    status: 'completata',
    createdAt: minutesAgo(90),
    estimatedStartAt: minutesAgo(70),
    startedAt: minutesAgo(68),
    completedAt: minutesAgo(60),
    position: 0,
  },
  {
    id: 'TC-I9V5',
    patientName: 'Francesco Bruno',
    phone: '+39 334 3331234',
    doctorId: 'dr-bianchi',
    doctorName: 'Dott.ssa Giulia Bianchi',
    requestType: 'controllo',
    status: 'completata',
    createdAt: minutesAgo(120),
    estimatedStartAt: minutesAgo(100),
    startedAt: minutesAgo(98),
    completedAt: minutesAgo(55),
    position: 0,
  },
  {
    id: 'TC-J3S7',
    patientName: 'Carmela Greco',
    phone: '+39 348 8881234',
    doctorId: 'dr-ferrari',
    doctorName: 'Dott. Antonio Ferrari',
    requestType: 'visita',
    status: 'no_show',
    createdAt: minutesAgo(180),
    estimatedStartAt: minutesAgo(160),
    position: 0,
  },
];

const INITIAL_STUDIOS: Studio[] = [
  {
    id: 's1',
    name: 'Studio Medico Dott. Rossi',
    slug: 'studio-demo',
    address: 'Via Roma 15, Milano',
    phone: '+39 02 1234567',
    plan: 'professional',
    status: 'attivo',
    planExpiry: new Date('2026-12-31'),
    doctorCount: 5,
    smsUsedThisMonth: 342,
    smsLimit: 1000,
    primaryColor: '#10b981',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 's2',
    name: 'Poliambulatorio Milano Centro',
    slug: 'milano-centro',
    address: 'Corso Buenos Aires 42, Milano',
    phone: '+39 02 9876543',
    plan: 'business',
    status: 'attivo',
    planExpiry: new Date('2026-06-30'),
    doctorCount: 18,
    smsUsedThisMonth: 1847,
    smsLimit: 3000,
    primaryColor: '#3b82f6',
    createdAt: new Date('2024-11-03'),
  },
  {
    id: 's3',
    name: 'Studio Fisioterapico Bianchi',
    slug: 'fisio-bianchi',
    address: 'Via Torino 88, Torino',
    phone: '+39 011 5556789',
    plan: 'starter',
    status: 'attivo',
    planExpiry: new Date('2026-08-15'),
    doctorCount: 2,
    smsUsedThisMonth: 87,
    smsLimit: 200,
    primaryColor: '#8b5cf6',
    createdAt: new Date('2025-03-20'),
  },
  {
    id: 's4',
    name: 'Studio Legale Ferretti & Associati',
    slug: 'legale-ferretti',
    address: 'Via Dante 7, Roma',
    phone: '+39 06 3334455',
    plan: 'starter',
    status: 'prova',
    planExpiry: new Date('2026-06-07'),
    doctorCount: 3,
    smsUsedThisMonth: 12,
    smsLimit: 200,
    primaryColor: '#f59e0b',
    createdAt: new Date('2026-05-24'),
  },
  {
    id: 's5',
    name: 'Centro Estetico Luna',
    slug: 'luna-estetica',
    address: 'Via Nazionale 55, Napoli',
    phone: '+39 081 7778899',
    plan: 'free',
    status: 'attivo',
    planExpiry: new Date('2099-12-31'),
    doctorCount: 1,
    smsUsedThisMonth: 14,
    smsLimit: 20,
    primaryColor: '#ec4899',
    createdAt: new Date('2025-07-10'),
  },
  {
    id: 's6',
    name: 'Studio Dentistico Romano',
    slug: 'dentista-romano',
    address: 'Corso Italia 23, Bologna',
    phone: '+39 051 2223344',
    plan: 'professional',
    status: 'sospeso',
    planExpiry: new Date('2026-02-28'),
    doctorCount: 4,
    smsUsedThisMonth: 0,
    smsLimit: 1000,
    primaryColor: '#06b6d4',
    createdAt: new Date('2024-09-01'),
  },
];

const HOURLY_DATA: HourlyData[] = [
  { hour: 8,  label: '8:00',  count: 3 },
  { hour: 9,  label: '9:00',  count: 8 },
  { hour: 10, label: '10:00', count: 14 },
  { hour: 11, label: '11:00', count: 11 },
  { hour: 12, label: '12:00', count: 6 },
  { hour: 13, label: '13:00', count: 2 },
  { hour: 14, label: '14:00', count: 9 },
  { hour: 15, label: '15:00', count: 13 },
  { hour: 16, label: '16:00', count: 10 },
  { hour: 17, label: '17:00', count: 5 },
];

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly _doctors = signal<Doctor[]>(INITIAL_DOCTORS);
  private readonly _queue = signal<Booking[]>([...INITIAL_QUEUE, ...makeHistory()]);
  private readonly _studios = signal<Studio[]>(INITIAL_STUDIOS);
  private readonly _suspended = signal<boolean>(false);

  readonly doctors = this._doctors.asReadonly();
  readonly queue = this._queue.asReadonly();
  readonly studios = this._studios.asReadonly();
  readonly suspended = this._suspended.asReadonly();

  readonly activeQueue = computed(() =>
    this._queue().filter(b => b.status === 'in_attesa' || b.status === 'in_corso')
  );

  readonly waitingQueue = computed(() =>
    this._queue().filter(b => b.status === 'in_attesa').sort((a, b) => a.position - b.position)
  );

  readonly inCorsoQueue = computed(() =>
    this._queue().filter(b => b.status === 'in_corso')
  );

  readonly dailyStats = computed<DailyStats>(() => {
    const today = this._queue().filter(b => {
      const d = b.createdAt;
      return d.toDateString() === new Date().toDateString();
    });
    return {
      totalBookings: today.length,
      inAttesa: today.filter(b => b.status === 'in_attesa').length,
      inCorso: today.filter(b => b.status === 'in_corso').length,
      completate: today.filter(b => b.status === 'completata').length,
      annullate: today.filter(b => b.status === 'annullata').length,
      noShow: today.filter(b => b.status === 'no_show').length,
      avgWaitMinutes: 12,
      avgVisitMinutes: 18,
      noShowRate: 8.3,
      hourlyData: HOURLY_DATA,
    };
  });

  readonly globalStats = computed<GlobalStats>(() => {
    const studios = this._studios();
    return {
      activeStudios: studios.filter(s => s.status === 'attivo').length,
      activeQueues: studios.filter(s => s.status === 'attivo').length - 1,
      smsSentToday: 847,
      totalBookingsToday: this._queue().filter(b =>
        b.createdAt.toDateString() === new Date().toDateString()
      ).length,
      totalBookingsMonth: 1243,
      newStudiosThisMonth: 3,
      monthlyRevenue: 5_600,
    };
  });

  readonly historyBookings = computed(() =>
    this._queue()
      .filter(b => ['completata', 'annullata', 'no_show'].includes(b.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

  addToQueue(
    partial: Pick<Booking, 'patientName' | 'phone' | 'doctorId' | 'doctorName' | 'requestType'> & { internalNote?: string }
  ): Booking {
    const waiting = this.waitingQueue();
    const position = waiting.length + 1;
    const waitMinutes = waiting.length * 15 + 8;
    const now = new Date();
    const booking: Booking = {
      ...partial,
      id: this.generateCode(),
      status: 'in_attesa',
      createdAt: now,
      estimatedStartAt: new Date(now.getTime() + waitMinutes * 60000),
      position,
    };
    this._queue.update(q => [...q, booking]);
    return booking;
  }

  updateStatus(id: string, status: BookingStatus): void {
    const now = new Date();
    this._queue.update(q =>
      q.map(b => {
        if (b.id !== id) return b;
        return {
          ...b,
          status,
          startedAt: status === 'in_corso' && !b.startedAt ? now : b.startedAt,
          completedAt: (status === 'completata' || status === 'no_show') ? now : b.completedAt,
        };
      })
    );
    this.recalcPositions();
  }

  reorderWaiting(fromIndex: number, toIndex: number): void {
    this._queue.update(q => {
      const waiting = q.filter(b => b.status === 'in_attesa').sort((a, b) => a.position - b.position);
      const others = q.filter(b => b.status !== 'in_attesa');
      const [moved] = waiting.splice(fromIndex, 1);
      waiting.splice(toIndex, 0, moved);
      const reordered = waiting.map((b, i) => ({
        ...b,
        position: i + 1,
        estimatedStartAt: new Date(Date.now() + (i * 15 + 8) * 60000),
      }));
      return [...others, ...reordered];
    });
  }

  addGlobalDelay(minutes: number): void {
    this._queue.update(q =>
      q.map(b =>
        b.status === 'in_attesa'
          ? { ...b, estimatedStartAt: new Date(b.estimatedStartAt.getTime() + minutes * 60000) }
          : b
      )
    );
  }

  toggleSuspended(): void {
    this._suspended.update(v => !v);
  }

  toggleStudioStatus(studioId: string): void {
    this._studios.update(s =>
      s.map(st =>
        st.id === studioId
          ? { ...st, status: st.status === 'attivo' ? 'sospeso' : 'attivo' }
          : st
      )
    );
  }

  changeStudioPlan(studioId: string, plan: PlanType): void {
    this._studios.update(s =>
      s.map(st => (st.id === studioId ? { ...st, plan } : st))
    );
  }

  generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return 'TC-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private recalcPositions(): void {
    this._queue.update(q => {
      let pos = 1;
      return q.map(b =>
        b.status === 'in_attesa'
          ? { ...b, position: pos++, estimatedStartAt: new Date(Date.now() + (pos - 1) * 15 * 60000 + 480000) }
          : b
      );
    });
  }

  addRandomPatient(): void {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const doctor = INITIAL_DOCTORS.filter(d => d.available)[Math.floor(Math.random() * 4)];
    const type = REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];
    this.addToQueue({
      patientName: name,
      phone: `+39 3${Math.floor(Math.random() * 89 + 10)} ${Math.floor(Math.random() * 9000000 + 1000000)}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      requestType: type,
    });
  }
}
