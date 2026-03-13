import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  
  processPayment(payload: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(environment.apiUrl + '/payments/process', payload);
  }

  confirmOtp(payload: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(environment.apiUrl + '/payments/confirm-otp', payload);
  }
}
