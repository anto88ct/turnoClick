import { Component, signal, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {
  // Common loading state signal
  readonly isLoading = signal<boolean>(false);
  
  // Subject for clean subscription disposal in components
  protected readonly destroy$ = new Subject<void>();

  setLoading(value: boolean): void {
    this.isLoading.set(value);
  }

  // Utility method for safe format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  // Utility method to format date
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
