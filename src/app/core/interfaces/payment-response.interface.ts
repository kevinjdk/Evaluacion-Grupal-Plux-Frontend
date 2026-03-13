export interface PaymentResponse { success: boolean;
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'OTP_REQUIRED' | '3DS_REQUIRED';
  message: string;
  data?: any;
}
