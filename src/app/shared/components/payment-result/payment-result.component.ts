import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent {
  @Input() step: string = '';
  @Input() message: string = '';
  @Input() detail: any = null;

  @Output() retry = new EventEmitter<void>();

  get typeofDetail(): string {
    return typeof this.detail;
  }

  onRetry() {
    this.retry.emit();
  }
}
