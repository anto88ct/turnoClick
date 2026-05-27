export type FamilyRelation = 'coniuge' | 'figlio' | 'figlia' | 'padre' | 'madre' | 'fratello' | 'sorella' | 'altro';

export interface PatientFamilyMember {
  id: string;
  name: string;
  dateOfBirth: string;
  relation: FamilyRelation;
  fiscalCode?: string;
  phone?: string;
}

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  cap: string;
  fiscalCode: string;
  familyMembers: PatientFamilyMember[];
  createdAt: string;
}

export interface StoredPatientUser extends PatientUser {
  _passwordHash: string;
}

export const RELATION_LABELS: Record<FamilyRelation, string> = {
  coniuge:  'Coniuge',
  figlio:   'Figlio',
  figlia:   'Figlia',
  padre:    'Padre',
  madre:    'Madre',
  fratello: 'Fratello',
  sorella:  'Sorella',
  altro:    'Altro',
};
