import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ad-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-button.component.html',
  styleUrls: ['./ad-button.component.scss']
})
export class AdButtonComponent extends BaseComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'outline-primary' | 'outline-secondary' | 'ghost' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() iconClass: string = '';
  @Input() btnClass: string = '';

  @Output() onClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const baseClass = 'btn d-inline-flex align-items-center justify-content-center gap-2 transition-all font-semibold rounded-3 px-4 py-2.5';
    let variantClass = '';
    
    switch (this.variant) {
      case 'primary': 
        variantClass = 'btn-primary bg-tc-600 border-0 text-white hover:bg-tc-700 shadow-sm'; 
        break;
      case 'secondary': 
        variantClass = 'btn-secondary bg-slate-600 border-0 text-white hover:bg-slate-700 shadow-sm'; 
        break;
      case 'danger': 
        variantClass = 'btn-danger bg-rose-600 border-0 text-white hover:bg-rose-700 shadow-sm'; 
        break;
      case 'warning': 
        variantClass = 'btn-warning bg-amber-500 border-0 text-slate-900 hover:bg-amber-600 shadow-sm'; 
        break;
      case 'success': 
        variantClass = 'btn-success bg-tc-500 border-0 text-white hover:bg-tc-600 shadow-sm'; 
        break;
      case 'outline-primary': 
        variantClass = 'btn-outline-primary border-2 border-tc-600 text-tc-600 bg-transparent hover:bg-tc-50 hover:text-tc-700'; 
        break;
      case 'outline-secondary': 
        variantClass = 'btn-outline-secondary border-2 border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50'; 
        break;
      case 'ghost': 
        variantClass = 'btn-link text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-decoration-none'; 
        break;
    }
    
    return `${baseClass} ${variantClass} ${this.btnClass}`;
  }

  handleCLick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
