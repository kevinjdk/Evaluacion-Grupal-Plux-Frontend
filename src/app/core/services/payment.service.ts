import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  processPayment(payload: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(environment.apiUrl + '/payment', payload);
  }

  confirmOtp(payload: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(environment.apiUrl + '/payment/otp', payload);
  }

  confirm3DS(payload: { pti: string, pcc: string, ptk: string }): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(environment.apiUrl + '/payment/3ds/confirm', payload);
  }
}
