export type PlanType = 'free' | 'starter' | 'professional' | 'business';

export interface Plan {
  id: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxDoctors: number | null;
  smsPerMonth: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
  color: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    maxDoctors: 1,
    smsPerMonth: 20,
    features: [
      '1 medico',
      '20 SMS/mese',
      'Gestione coda live',
      'QR code personalizzato',
      'Report base',
    ],
    highlighted: false,
    color: 'slate',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    priceYearly: 290,
    maxDoctors: 3,
    smsPerMonth: 200,
    features: [
      '3 medici',
      '200 SMS/mese',
      'Gestione coda live',
      'QR code personalizzato',
      'Report avanzati',
      'Prenotazioni programmate',
    ],
    highlighted: false,
    color: 'tc',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 79,
    priceYearly: 790,
    maxDoctors: 10,
    smsPerMonth: 1000,
    features: [
      '10 medici',
      '1.000 SMS/mese',
      'Gestione coda live',
      'QR code personalizzato',
      'Report completi',
      'Personalizzazione SMS',
      'Prenotazioni programmate',
    ],
    highlighted: true,
    badge: 'Più scelto',
    color: 'tc',
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 149,
    priceYearly: 1490,
    maxDoctors: null,
    smsPerMonth: 3000,
    features: [
      'Medici illimitati',
      '3.000 SMS/mese',
      'Report enterprise',
      'Personalizzazione SMS',
      'Modulo ecommerce',
      'API e integrazioni',
      'Assistenza prioritaria',
      'Prenotazioni programmate',
    ],
    highlighted: false,
    badge: 'Enterprise',
    color: 'slate',
  },
];
