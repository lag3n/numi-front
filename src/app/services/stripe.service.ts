import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface PriceInfo {
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
  productName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Creates a checkout session for the specified price ID and user ID
   * @param priceId The Stripe price ID for the subscription
   * @param userId The user's ID to associate with the subscription
   * @returns Observable with session ID and optional URL
   */
  createCheckoutSession(priceId: string, userId?: number): Observable<{ sessionId: string, url?: string }> {
    // Use the correct URL for the Stripe server (port 8080)
    return this.http.post<{ sessionId: string, url?: string }>(
      'http://localhost:8080/create-checkout-session', 
      { priceId, userId },
      { withCredentials: true }
    );
  }
  
  /**
   * Checks the user's subscription status and determines if credits should be renewed
   * @param userId The user's ID
   * @param subscriptionId The Stripe subscription ID
   * @returns Observable with subscription status and credit information
   */
  checkSubscription(userId: number, subscriptionId: string): Observable<{
    active: boolean;
    tier?: string;
    credits?: number;
    shouldRenewCredits?: boolean;
    daysSinceRenewal?: number;
    nextRenewalDate?: Date;
    status?: string;
    message?: string;
  }> {
    return this.http.post<any>(
      'http://localhost:8080/check-subscription',
      { userId, subscriptionId },
      { withCredentials: true }
    );
  }

  redirectToCheckout(sessionId: string, url?: string) {
    // If a direct URL is provided, use it (Stripe hosted checkout)
    if (url) {
      window.location.href = url;
      return;
    }
    
    // Otherwise use the Stripe.js approach with sessionId
    if (typeof window !== 'undefined' && (window as any).Stripe) {
      const stripe = (window as any).Stripe(environment.stripePublishableKey);
      stripe.redirectToCheckout({ sessionId });
    } else {
      console.error('Stripe.js not loaded');
    }
  }
}
