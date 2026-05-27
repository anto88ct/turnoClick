import { Injectable, computed, signal } from '@angular/core';
import { Booking, BookingStatus, RequestType } from '../models/booking.model';
import { Doctor } from '../models/doctor.model';
import { Studio } from '../models/studio.model';
import { DailyStats, GlobalStats, HourlyData } from '../models/stats.model';
import { PlanType } from '../models/plan.model';
import { Client, Visit, Attachment, PaymentMethod } from '../models/client.model';
import { SitePageConfig, SiteBlock } from '../models/site-builder.model';
import { DoctorMessage, DoctorStatus, DoctorAvailability, DoctorStatusType } from '../models/doctor-hub.model';

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

const DEFAULT_SITE_PAGE: SitePageConfig = {
  theme: {
    primaryColor: '#6366f1',
    fontFamily: 'Inter, sans-serif',
    pageBackgroundColor: '#ffffff'
  },
  blocks: [
    {
      id: 'block-hero-1',
      type: 'hero',
      order: 0,
      paddingY: 'none',
      config: {
        title: 'Benvenuti allo Studio Medico',
        subtitle: 'Prenota la tua visita online in pochi clic o mettiti in coda comodamente da casa.',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
        overlayOpacity: 0.6,
        minHeight: 380,
        textAlign: 'center',
        buttonLabel: 'Prenota Ora',
        buttonLink: '#prenota'
      } as any
    },
    {
      id: 'block-text-1',
      type: 'text',
      order: 1,
      paddingY: 'md',
      config: {
        content: '<p>Il nostro studio offre servizi medici di alta qualità dal 2005. Siamo un team di professionisti dedicati alla tua salute e al tuo benessere.</p>',
        align: 'center',
        fontSize: 'normal',
        color: '#475569'
      } as any
    },
    {
      id: 'block-spacer-1',
      type: 'spacer',
      order: 2,
      paddingY: 'none',
      config: {
        height: 16
      } as any
    },
    {
      id: 'block-phone-1',
      type: 'phone-button',
      order: 3,
      paddingY: 'md',
      config: {
        phoneNumber: '+39021234567',
        label: 'Chiama lo Studio',
        color: 'primary',
        icon: true,
        size: 'md',
        align: 'center'
      } as any
    }
  ]
};

const INITIAL_DOCTOR_MESSAGES: DoctorMessage[] = [
  {
    id: 'MSG-001',
    fromType: 'segreteria',
    fromId: 'segreteria',
    fromName: 'Segreteria',
    toId: 'dr-rossi',
    body: 'Buongiorno Dott. Rossi, il paziente Mario Gentile ha chiesto di essere ricontattato per un appuntamento urgente. Ha già telefonato due volte stamattina.',
    createdAt: new Date(Date.now() - 45 * 60000),
    read: false,
  },
  {
    id: 'MSG-002',
    fromType: 'segreteria',
    fromId: 'segreteria',
    fromName: 'Segreteria',
    toId: 'dr-rossi',
    body: 'Ricorda che alle 15:30 hai il consulto con Dott. Ferrari per il caso Ricci.',
    createdAt: new Date(Date.now() - 2 * 60 * 60000),
    read: true,
  },
  {
    id: 'MSG-003',
    fromType: 'medico',
    fromId: 'dr-ferrari',
    fromName: 'Dott. Antonio Ferrari',
    toId: 'dr-rossi',
    body: 'Marco, ti mando i referti del paziente Ricci prima del consulto. Caso interessante, patologia rara.',
    createdAt: new Date(Date.now() - 3 * 60 * 60000),
    read: true,
  },
  {
    id: 'MSG-004',
    fromType: 'segreteria',
    fromId: 'segreteria',
    fromName: 'Segreteria',
    toId: 'dr-bianchi',
    body: 'Dott.ssa Bianchi, la paziente Elena Marini chiede di spostare la seduta di fisioterapia di domani al pomeriggio.',
    createdAt: new Date(Date.now() - 30 * 60000),
    read: false,
  },
  {
    id: 'MSG-005',
    fromType: 'segreteria',
    fromId: 'segreteria',
    fromName: 'Segreteria',
    toId: 'dr-ferrari',
    body: 'Dott. Ferrari, la signora Greco ha chiamato per i risultati degli esami del sangue. Può richiamarla entro oggi?',
    createdAt: new Date(Date.now() - 90 * 60000),
    read: false,
  },
  {
    id: 'MSG-006',
    fromType: 'medico',
    fromId: 'dr-rossi',
    fromName: 'Dott. Marco Rossi',
    toId: 'dr-bianchi',
    body: 'Giulia, ho un paziente con lombosciatalgia che potrebbe beneficiare della tua fisioterapia. Te lo mando questa settimana.',
    createdAt: new Date(Date.now() - 24 * 60 * 60000),
    read: true,
  },
];

const INITIAL_DOCTOR_STATUSES: DoctorStatus[] = [
  { doctorId: 'dr-rossi',    status: 'in_visita',    patientName: 'Mario Gentile',   updatedAt: new Date(Date.now() - 7 * 60000) },
  { doctorId: 'dr-bianchi',  status: 'disponibile',  updatedAt: new Date(Date.now() - 10 * 60000) },
  { doctorId: 'dr-ferrari',  status: 'in_visita',    patientName: 'Giovanni Russo',  updatedAt: new Date(Date.now() - 12 * 60000) },
  { doctorId: 'dr-romano',   status: 'assente',      updatedAt: new Date(Date.now() - 120 * 60000) },
  { doctorId: 'dr-esposito', status: 'disponibile',  updatedAt: new Date(Date.now() - 5 * 60000) },
];

const today = new Date();
const dateStr = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const INITIAL_DOCTOR_AVAILABILITIES: DoctorAvailability[] = [
  {
    id: 'AV-001',
    doctorId: 'dr-rossi',
    type: 'ferie',
    dateFrom: dateStr(addDays(today, 14)),
    dateTo: dateStr(addDays(today, 21)),
    note: 'Vacanze estive. Coprire con il Dott. Ferrari per le urgenze.',
  },
  {
    id: 'AV-002',
    doctorId: 'dr-bianchi',
    type: 'assente',
    dateFrom: dateStr(addDays(today, 3)),
    dateTo: dateStr(addDays(today, 3)),
    timeFrom: '14:00',
    timeTo: '18:00',
    note: 'Convegno fisioterapia – solo mattina disponibile.',
  },
  {
    id: 'AV-003',
    doctorId: 'dr-romano',
    type: 'ferie',
    dateFrom: dateStr(addDays(today, 0)),
    dateTo: dateStr(addDays(today, 7)),
    note: 'In ferie questa settimana.',
  },
  {
    id: 'AV-004',
    doctorId: 'dr-esposito',
    type: 'reperibile',
    dateFrom: dateStr(addDays(today, 5)),
    dateTo: dateStr(addDays(today, 6)),
    timeFrom: '08:00',
    timeTo: '13:00',
    note: 'Reperibile solo mattina nel weekend.',
  },
];

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly _doctors = signal<Doctor[]>(INITIAL_DOCTORS);
  private readonly _queue = signal<Booking[]>([...INITIAL_QUEUE, ...makeHistory()]);
  private readonly _studios = signal<Studio[]>(INITIAL_STUDIOS);
  private readonly _suspended = signal<boolean>(false);
  private readonly _clients = signal<Client[]>([]);
  private readonly _sitePages = signal<Record<string, SitePageConfig>>(
    this._loadSitePages()
  );
  private readonly _doctorMessages = signal<DoctorMessage[]>(INITIAL_DOCTOR_MESSAGES);
  private readonly _doctorStatuses = signal<DoctorStatus[]>(INITIAL_DOCTOR_STATUSES);
  private readonly _doctorAvailabilities = signal<DoctorAvailability[]>(INITIAL_DOCTOR_AVAILABILITIES);
  private readonly _activeDoctorId = signal<string>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tc_active_doctor') : null) || 'dr-rossi'
  );

  readonly doctors = this._doctors.asReadonly();
  readonly queue = this._queue.asReadonly();
  readonly studios = this._studios.asReadonly();
  readonly suspended = this._suspended.asReadonly();
  readonly clients = this._clients.asReadonly();
  readonly doctorMessages = this._doctorMessages.asReadonly();
  readonly doctorStatuses = this._doctorStatuses.asReadonly();
  readonly doctorAvailabilities = this._doctorAvailabilities.asReadonly();
  readonly activeDoctorId = this._activeDoctorId.asReadonly();

  readonly queueEnabled   = signal<boolean>(this._loadPref('tc_queue_enabled', true));
  readonly bookingEnabled = signal<boolean>(this._loadPref('tc_booking_enabled', true));
  readonly brandColor     = signal<string>(this._loadStrPref('tc_brand_color', '#6366f1'));

  constructor() {
    this.initializeClients();
    this._applyBrandColor(this.brandColor());
  }

  private _loadSitePages(): Record<string, SitePageConfig> {
    try {
      const raw = localStorage.getItem('tc_site_pages');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { 'studio-demo': JSON.parse(JSON.stringify(DEFAULT_SITE_PAGE)) };
  }

  private _loadPref(key: string, def: boolean): boolean {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : def;
    } catch { return def; }
  }

  private _loadStrPref(key: string, def: string): string {
    return localStorage.getItem(key) ?? def;
  }

  private _applyBrandColor(hex: string): void {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--brand', hex);
      document.documentElement.style.setProperty('--brand-dark', this._darken(hex));
      document.documentElement.style.setProperty('--brand-light', this._lighten(hex));
      document.documentElement.style.setProperty('--brand-muted', `${hex}1f`);
      document.documentElement.style.setProperty('--brand-glow', `${hex}40`);
    }
  }

  private _darken(hex: string): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - 30);
    const g = Math.max(0, ((num >> 8) & 0xff) - 30);
    const b = Math.max(0, (num & 0xff) - 30);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private _lighten(hex: string): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + 210);
    const g = Math.min(255, ((num >> 8) & 0xff) + 210);
    const b = Math.min(255, (num & 0xff) + 210);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  setBrandColor(hex: string): void {
    this.brandColor.set(hex);
    localStorage.setItem('tc_brand_color', hex);
    this._applyBrandColor(hex);
  }

  setQueueEnabled(val: boolean): void {
    this.queueEnabled.set(val);
    localStorage.setItem('tc_queue_enabled', JSON.stringify(val));
  }

  setBookingEnabled(val: boolean): void {
    this.bookingEnabled.set(val);
    localStorage.setItem('tc_booking_enabled', JSON.stringify(val));
  }

  private initializeClients(): void {
    const bookings = this._queue();
    const clientMap = new Map<string, Client>();
    
    const getServicePrice = (type: string) => {
      switch (type) {
        case 'visita': return 80;
        case 'ricetta': return 15;
        case 'certificato': return 40;
        case 'controllo': return 50;
        case 'ritiro referti': return 10;
        default: return 30;
      }
    };

    const methods: PaymentMethod[] = ['contanti', 'carta', 'misto'];

    bookings.forEach(b => {
      const name = b.patientName;
      if (!clientMap.has(name)) {
        const cleanName = name.toLowerCase().replace(/\s+/g, '.');
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const randNum = Math.floor(Math.random() * 90 + 10);
        const cf = `${initials}XYZ${randNum}A01B`;
        
        clientMap.set(name, {
          id: 'CL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          name: name,
          phone: b.phone || '+39 347 1234567',
          email: `${cleanName}@email.com`,
          birthDate: `${1950 + Math.floor(Math.random() * 45)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
          fiscalCode: cf,
          address: `Via delle Primule ${Math.floor(Math.random() * 100) + 1}, Milano`,
          createdAt: b.createdAt,
          visits: [],
          attachments: [
            {
              id: 'ATT-INIT-1',
              name: 'referto_visita_cardiologica.pdf',
              size: '342 KB',
              type: 'pdf',
              uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              url: '#'
            },
            {
              id: 'ATT-INIT-2',
              name: 'tessera_sanitaria.jpg',
              size: '1.2 MB',
              type: 'image',
              uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              url: '#'
            }
          ]
        });
      }

      const client = clientMap.get(name)!;
      if (b.status === 'completata') {
        const amount = getServicePrice(b.requestType);
        const paymentMethod = methods[Math.floor(Math.random() * methods.length)];
        let cashAmount = 0;
        let cardAmount = 0;
        if (paymentMethod === 'contanti') {
          cashAmount = amount;
        } else if (paymentMethod === 'carta') {
          cardAmount = amount;
        } else {
          cashAmount = amount * 0.5;
          cardAmount = amount * 0.5;
        }

        const visit: Visit = {
          id: 'VIST-' + b.id,
          date: b.completedAt || b.createdAt,
          doctorName: b.doctorName,
          serviceName: b.requestType.charAt(0).toUpperCase() + b.requestType.slice(1),
          paymentMethod,
          amount,
          paymentDetails: { cashAmount, cardAmount }
        };
        client.visits.push(visit);
      }
    });

    clientMap.forEach(client => {
      if (client.visits.length === 0) {
        const amount = 80;
        client.visits.push({
          id: 'VIST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          doctorName: 'Dott. Marco Rossi',
          serviceName: 'Visita Generale',
          paymentMethod: 'misto',
          amount,
          paymentDetails: { cashAmount: amount * 0.5, cardAmount: amount * 0.5 }
        });
      }
      client.visits.sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    this._clients.set(Array.from(clientMap.values()));
  }

  updateClient(updated: Client): void {
    this._clients.update(cls => cls.map(c => c.id === updated.id ? updated : c));
  }

  addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'visits' | 'attachments'>): Client {
    const newClient: Client = {
      ...clientData,
      id: 'CL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date(),
      visits: [],
      attachments: []
    };
    this._clients.update(cls => [newClient, ...cls]);
    return newClient;
  }

  addAttachmentToClient(clientId: string, attachment: Omit<Attachment, 'id' | 'uploadDate'>): void {
    const newAttachment: Attachment = {
      ...attachment,
      id: 'ATT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      uploadDate: new Date()
    };
    this._clients.update(cls =>
      cls.map(c => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          attachments: [newAttachment, ...c.attachments]
        };
      })
    );
  }

  deleteAttachmentFromClient(clientId: string, attachmentId: string): void {
    this._clients.update(cls =>
      cls.map(c => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          attachments: c.attachments.filter(a => a.id !== attachmentId)
        };
      })
    );
  }

  addVisitToClient(clientId: string, visitData: Omit<Visit, 'id'>): void {
    const newVisit: Visit = {
      ...visitData,
      id: 'VIST-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    this._clients.update(cls =>
      cls.map(c => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          visits: [newVisit, ...c.visits]
        };
      })
    );
  }

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

  // Site Builder Methods
  getSitePage(studioSlug: string): SitePageConfig {
    const pages = this._sitePages();
    return pages[studioSlug] || JSON.parse(JSON.stringify(DEFAULT_SITE_PAGE));
  }

  saveSitePage(studioSlug: string, config: SitePageConfig): void {
    this._sitePages.update(pages => {
      const updated = { ...pages, [studioSlug]: JSON.parse(JSON.stringify(config)) };
      try { localStorage.setItem('tc_site_pages', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  // Doctor Hub Methods
  messagesForDoctor(doctorId: string) {
    return computed(() =>
      this._doctorMessages().filter(m => m.toId === doctorId || m.fromId === doctorId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    );
  }

  unreadCountForDoctor(doctorId: string) {
    return computed(() =>
      this._doctorMessages().filter(m => m.toId === doctorId && !m.read).length
    );
  }

  sendMessage(msg: Omit<DoctorMessage, 'id' | 'createdAt' | 'read'>): void {
    const newMsg: DoctorMessage = {
      ...msg,
      id: 'MSG-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date(),
      read: false,
    };
    this._doctorMessages.update(msgs => [...msgs, newMsg]);
  }

  markMessagesReadForDoctor(doctorId: string): void {
    this._doctorMessages.update(msgs =>
      msgs.map(m => m.toId === doctorId && !m.read ? { ...m, read: true } : m)
    );
  }

  getDoctorStatus(doctorId: string): DoctorStatus | undefined {
    return this._doctorStatuses().find(s => s.doctorId === doctorId);
  }

  setDoctorStatus(doctorId: string, status: DoctorStatusType, patientName?: string): void {
    this._doctorStatuses.update(statuses => {
      const exists = statuses.find(s => s.doctorId === doctorId);
      const updated: DoctorStatus = { doctorId, status, patientName, updatedAt: new Date() };
      return exists
        ? statuses.map(s => s.doctorId === doctorId ? updated : s)
        : [...statuses, updated];
    });
  }

  addDoctorAvailability(av: Omit<DoctorAvailability, 'id'>): void {
    const newAv: DoctorAvailability = {
      ...av,
      id: 'AV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    };
    this._doctorAvailabilities.update(avs => [...avs, newAv]);
  }

  updateDoctorAvailability(av: DoctorAvailability): void {
    this._doctorAvailabilities.update(avs => avs.map(a => a.id === av.id ? av : a));
  }

  deleteDoctorAvailability(id: string): void {
    this._doctorAvailabilities.update(avs => avs.filter(a => a.id !== id));
  }

  setActiveDoctor(doctorId: string): void {
    this._activeDoctorId.set(doctorId);
    try { localStorage.setItem('tc_active_doctor', doctorId); } catch {}
  }

  availabilitiesForDoctor(doctorId: string) {
    return computed(() =>
      this._doctorAvailabilities().filter(a => a.doctorId === doctorId)
        .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
    );
  }
}
