import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  template: `
    <div class="container mt-5 text-center">
      <h1 class="display-4 text-warning">Checkout Cancelled</h1>
      <p class="lead">Your payment was not processed.</p>
      <p>You can try again whenever you're ready.</p>
      <button class="btn btn-primary mt-3" (click)="goToPricing()">Return to Pricing</button>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
  `]
})
export class CheckoutCancelComponent {
  constructor(private router: Router) {}

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
