import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PaymentPageComponent } from './features/payment/components/payment-page/payment-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, PaymentPageComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'plux-payment-front';
}
