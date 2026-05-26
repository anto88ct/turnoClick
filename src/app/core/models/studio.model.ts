import { PlanType } from './plan.model';

export type StudioStatus = 'attivo' | 'sospeso' | 'prova';

export interface Studio {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  plan: PlanType;
  status: StudioStatus;
  planExpiry: Date;
  doctorCount: number;
  smsUsedThisMonth: number;
  smsLimit: number;
  primaryColor: string;
  logoUrl?: string;
  createdAt: Date;
}
