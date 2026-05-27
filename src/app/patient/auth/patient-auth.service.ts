import { Injectable, signal } from '@angular/core';
import { PatientUser, StoredPatientUser, PatientFamilyMember, FamilyRelation } from './patient-auth.model';

const USERS_KEY = 'tc_patient_users';
const SESSION_KEY = 'tc_patient_session';

@Injectable({ providedIn: 'root' })
export class PatientAuthService {
  readonly currentUser = signal<PatientUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) return;
      const users = this.loadUsers();
      const stored = users.find(u => u.id === sessionId);
      if (stored) {
        this.currentUser.set(this.stripPassword(stored));
      }
    } catch {
      // ignore storage errors
    }
  }

  private loadUsers(): StoredPatientUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredPatientUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private stripPassword(u: StoredPatientUser): PatientUser {
    const { _passwordHash, ...user } = u;
    return user;
  }

  private hashPassword(pw: string): string {
    // Simple demo hash — not for production use
    let h = 0;
    for (let i = 0; i < pw.length; i++) {
      h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  register(data: {
    name: string; email: string; phone: string; password: string;
    dateOfBirth?: string; address?: string; city?: string; cap?: string; fiscalCode?: string;
  }): { user: PatientUser | null; error?: string } {
    const users = this.loadUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { user: null, error: 'Email già registrata. Effettua il login.' };
    }
    const newUser: StoredPatientUser = {
      id: `patient-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      dateOfBirth: data.dateOfBirth ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      cap: data.cap ?? '',
      fiscalCode: data.fiscalCode ?? '',
      familyMembers: [],
      createdAt: new Date().toISOString(),
      _passwordHash: this.hashPassword(data.password),
    };
    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem(SESSION_KEY, newUser.id);
    const user = this.stripPassword(newUser);
    this.currentUser.set(user);
    return { user };
  }

  login(email: string, password: string): { user: PatientUser | null; error?: string } {
    const users = this.loadUsers();
    const stored = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!stored) return { user: null, error: 'Email non trovata. Registrati per creare un account.' };
    if (stored._passwordHash !== this.hashPassword(password)) {
      return { user: null, error: 'Password errata. Riprova.' };
    }
    localStorage.setItem(SESSION_KEY, stored.id);
    const user = this.stripPassword(stored);
    this.currentUser.set(user);
    return { user };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  updateProfile(data: Partial<Omit<PatientUser, 'id' | 'createdAt' | 'familyMembers'>>): void {
    const current = this.currentUser();
    if (!current) return;
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...data };
    this.saveUsers(users);
    this.currentUser.set(this.stripPassword(users[idx]));
  }

  addFamilyMember(data: Omit<PatientFamilyMember, 'id'>): PatientFamilyMember {
    const current = this.currentUser();
    if (!current) throw new Error('Not logged in');
    const member: PatientFamilyMember = {
      ...data,
      id: `fm-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) throw new Error('User not found');
    users[idx].familyMembers = [...(users[idx].familyMembers ?? []), member];
    this.saveUsers(users);
    this.currentUser.set(this.stripPassword(users[idx]));
    return member;
  }

  updateFamilyMember(memberId: string, data: Partial<PatientFamilyMember>): void {
    const current = this.currentUser();
    if (!current) return;
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return;
    users[idx].familyMembers = users[idx].familyMembers.map(m =>
      m.id === memberId ? { ...m, ...data } : m
    );
    this.saveUsers(users);
    this.currentUser.set(this.stripPassword(users[idx]));
  }

  removeFamilyMember(memberId: string): void {
    const current = this.currentUser();
    if (!current) return;
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return;
    users[idx].familyMembers = users[idx].familyMembers.filter(m => m.id !== memberId);
    this.saveUsers(users);
    this.currentUser.set(this.stripPassword(users[idx]));
  }

  deleteAccount(): void {
    const current = this.currentUser();
    if (!current) return;
    const users = this.loadUsers().filter(u => u.id !== current.id);
    this.saveUsers(users);
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }
}
