import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentResultComponent } from '../../../../shared/components/payment-result/payment-result.component';
import { PaymentService } from '../../../../core/services/payment.service';
import { PaymentResponse } from '../../../../core/interfaces/payment-response.interface';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaymentResultComponent],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);

  status: 'PAYMENT' | 'OTP_REQUIRED' | '3DS_REQUIRED' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'PROCESSING' = 'PAYMENT';
  feedbackMessage = '';
  pendingOtpData: any = null;

  paymentForm: FormGroup = this.fb.group({
    firstName: ['Sesion 2', Validators.required],
    lastName: ['Grupo 2', Validators.required],
    documentNumber: ['1710020012', Validators.required],
    email: ['correo@prueba.com', [Validators.required, Validators.email]],
    phone: ['+593981552930', Validators.required],
    cardNumber: ['4540639936908783', [Validators.required, Validators.minLength(15)]],
    expMonth: ['04', Validators.required],
    expYear: ['29', Validators.required],
    cvv: ['123', Validators.required],
    amount: [10.00, [Validators.required, Validators.min(1)]]
  });

  otpForm: FormGroup = this.fb.group({
    otpCode: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitPayment() {
    if (this.paymentForm.invalid) return;
    this.status = 'PROCESSING';
    this.feedbackMessage = '';

    const payload = this.paymentForm.value;

    this.paymentService.processPayment(payload).subscribe({
      next: (res: PaymentResponse) => this.handleBackendResponse(res),
      error: (err: unknown) => this.handleError(err)
    });
  }

  submitOtp() {
    if (this.otpForm.invalid || !this.pendingOtpData) return;
    this.status = 'PROCESSING';
    this.feedbackMessage = '';

    const payload = {
      paymentId: this.pendingOtpData.paymentId,
      transactionId: this.pendingOtpData.transactionId,
      sessionId: this.pendingOtpData.sessionId,
      otpCode: this.otpForm.value.otpCode
    };

    this.paymentService.confirmOtp(payload).subscribe({
      next: (res: PaymentResponse) => this.handleBackendResponse(res),
      error: (err: unknown) => this.handleError(err)
    });
  }

  private handleBackendResponse(res: PaymentResponse) {
    this.feedbackMessage = res.message;

    if (res.status === 'OTP_REQUIRED') {
      this.pendingOtpData = res.data;
      this.status = 'OTP_REQUIRED';
    } else if (res.status === '3DS_REQUIRED') {
      this.status = '3DS_REQUIRED';
      if(res.data?.url) window.location.href = res.data.url;
    } else if (res.status === 'APPROVED') {
      this.status = 'APPROVED';
    } else if (res.status === 'DECLINED') {
      this.status = 'DECLINED';
    } else {
      this.status = 'ERROR';
    }
  }

  private handleError(err: unknown) {
    this.status = 'ERROR';
    this.feedbackMessage = 'Error de conexion con el backend local.';
    console.error(err);
  }
}
