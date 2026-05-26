export type RequestType =
  | 'visita'
  | 'ricetta'
  | 'certificato'
  | 'controllo'
  | 'ritiro referti'
  | 'altro';

export type BookingStatus =
  | 'in_attesa'
  | 'in_corso'
  | 'completata'
  | 'annullata'
  | 'no_show';

export interface Booking {
  id: string;
  patientName: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  requestType: RequestType;
  status: BookingStatus;
  createdAt: Date;
  estimatedStartAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  internalNote?: string;
  position: number;
  isUrgent?: boolean;
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  visita: 'Visita',
  ricetta: 'Ricetta',
  certificato: 'Certificato',
  controllo: 'Controllo',
  'ritiro referti': 'Ritiro referti',
  altro: 'Altro',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  in_attesa: 'In attesa',
  in_corso: 'In visita',
  completata: 'Completata',
  annullata: 'Annullata',
  no_show: 'No-show',
};
