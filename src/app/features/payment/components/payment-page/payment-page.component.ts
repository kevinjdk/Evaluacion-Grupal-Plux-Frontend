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
  private currentPayload: any = null;

  paymentForm: FormGroup = this.fb.group({
    firstName: ['Sesion 2', Validators.required],
    lastName: ['Grupo 2', Validators.required],
    documentNumber: ['1710020012', Validators.required],
    email: ['correo@prueba.com', [Validators.required, Validators.email]],
    phone: ['+593981552930', Validators.required],
    cardNumber: ['4540639936908783', [Validators.required, Validators.minLength(14)]],
    expMonth: ['04', Validators.required],
    expYear: ['29', Validators.required],
    cvv: ['123', Validators.required],
    amount: [10.00, [Validators.required, Validators.min(1)]]
  });

  otpForm: FormGroup = this.fb.group({
    otpCode: ['', [Validators.required, Validators.minLength(6)]]
  });

  private buildBasePayload() {
    const formVal = this.paymentForm.value;
    return {
      cardNumber: formVal.cardNumber,
      expirationYear: formVal.expYear,
      expirationMonth: formVal.expMonth,
      cvv: formVal.cvv,
      buyer: {
        documentNumber: formVal.documentNumber,
        firstName: formVal.firstName,
        lastName: formVal.lastName,
        phone: formVal.phone,
        email: formVal.email
      },
      baseAmount0: 0.00,
      baseAmount12: formVal.amount,
      installments: "0",
      interests: "0",
      description: "Pago prueba desde Angular",
      shippingAddress: {
        country: "Ecuador",
        city: "Quito",
        street: "Av Principal",
        number: "123"
      }
    };
  }

  submitPayment() {
    if (this.paymentForm.invalid) return;
    this.status = 'PROCESSING';
    this.feedbackMessage = '';

    this.currentPayload = this.buildBasePayload();

    this.paymentService.processPayment(this.currentPayload).subscribe({
      next: (res: PaymentResponse) => this.handleBackendResponse(res),
      error: (err: any) => this.handleError(err)
    });
  }

  submitOtp() {
    if (this.otpForm.invalid || !this.pendingOtpData || !this.currentPayload) return;
    this.status = 'PROCESSING';
    this.feedbackMessage = '';

    const payload = {
      ...this.currentPayload,
      description: "Pago con OTP",
      paramsOtp: {
        otpCode: this.otpForm.value.otpCode,
        idTransaction: this.pendingOtpData.idTransaction,
        sessionId: this.pendingOtpData.sessionId,
        tkn: this.pendingOtpData.tkn,
        tknky: this.pendingOtpData.tknky,
        tkniv: this.pendingOtpData.tkniv
      }
    };

    this.paymentService.confirmOtp(payload).subscribe({
      next: (res: PaymentResponse) => this.handleBackendResponse(res),
      error: (err: any) => this.handleError(err)
    });
  }

  private handleBackendResponse(res: PaymentResponse) {
    this.feedbackMessage = res.description || 'Procesado';

    switch (res.code) {
      case 0:
        this.status = 'APPROVED';
        break;
      case 100:
        this.pendingOtpData = res.detail;
        this.status = 'OTP_REQUIRED';
        break;
      case 102:
        this.status = 'OTP_REQUIRED';
        this.otpForm.get('otpCode')?.reset();
        break;
      case 103:
        this.status = '3DS_REQUIRED';
        if (res.detail?.url) {
          window.location.href = res.detail.url;
        }
        break;
      default:
        this.status = 'DECLINED';
        break;
    }
  }

  private handleError(err: any) {
    this.status = 'ERROR';
    this.feedbackMessage = err?.error?.description || err?.message || 'Error de conexión con el backend local.';
    console.error(err);
  }
}
