export type DoctorStatusType = 'disponibile' | 'in_visita' | 'quasi_finito' | 'terminato' | 'assente';

export interface DoctorMessage {
  id: string;
  fromType: 'segreteria' | 'medico';
  fromId: string;
  fromName: string;
  toId: string;
  body: string;
  createdAt: Date;
  read: boolean;
}

export interface DoctorStatus {
  doctorId: string;
  status: DoctorStatusType;
  patientName?: string;
  updatedAt: Date;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  type: 'disponibile' | 'ferie' | 'assente' | 'reperibile';
  dateFrom: string;
  dateTo: string;
  timeFrom?: string;
  timeTo?: string;
  note?: string;
}
