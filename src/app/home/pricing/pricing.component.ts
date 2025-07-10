import { Component, HostListener, OnInit } from '@angular/core';
import { StripeService } from '../../services/stripe.service';
import { AuthService } from '../../services/auth.service';

interface PricingTier {
  name: string;
  price: number;
  priceId: string;
  features: string[];
  isPopular?: boolean;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'] // corrected styleUrl to styleUrls
})
export class PricingComponent implements OnInit {
  selectedBox: number | null = null;
  isLoading = false;

  pricingTiers: PricingTier[] = [
    {
      name: 'Tier I',
      price: 7.99,
      priceId: 'price_1REkNAQqWiM8rPLDt6kYx6Xh',
      features: [
        '40 credits per month, renews every month',
        'Access to automated numismatic photo processing and adjustable editing features with presets'
      ]
    },
    {
      name: 'Tier II',
      price: 12.99,
      priceId: 'price_1REkanQqWiM8rPLDU9YKrHdC',
      features: [
        '80 credits per month, renews every month',
        'Access to automated bulk listing feature and adjustable editing features with presets'
      ],
      isPopular: true
    },
    {
      name: 'Business Tier',
      price: 99.99,
      priceId: 'price_1REkbCQqWiM8rPLD0QY3yQ9z',
      features: [
        'Unlimited credits per month, renews every month',
        'Custom business options. Contact us for specific requirements and needs'
      ]
    }
  ];

  constructor(private stripeService: StripeService, private authService: AuthService) {}

  ngOnInit() {
    this.loadStripeScript();
  }

  private loadStripeScript() {
    if (!document.getElementById('stripe-script')) {
      const script = document.createElement('script');
      script.id = 'stripe-script';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  selectBox(event: MouseEvent, boxNumber: number): void {
    event.stopPropagation(); // Prevent document click
    this.selectedBox = boxNumber;
  }

  async checkout(priceId: string) {
    try {
      this.isLoading = true;
      console.log('Creating checkout session for price:', priceId);
      
      // Check if user is logged in
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.log('User not logged in, redirecting to login page');
        this.isLoading = false;
        
        // Store the intended subscription in localStorage for after login
        localStorage.setItem('pendingSubscription', priceId);
        
        // Redirect to login page with return URL
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/pricing');
        return;
      }
      
      // User is logged in, proceed with checkout
      const userId = currentUser.id;
      console.log('User ID for subscription:', userId);
      
      // Create checkout session with user ID
      const response = await this.stripeService.createCheckoutSession(priceId, userId).toPromise();
      console.log('Checkout session response:', response);
      
      if (response) {
        if (response.url) {
          // If we have a direct URL, use it
          this.stripeService.redirectToCheckout(response.sessionId, response.url);
        } else if (response.sessionId) {
          // Otherwise use the sessionId with Stripe.js
          this.stripeService.redirectToCheckout(response.sessionId);
        } else {
          throw new Error('Invalid checkout session response');
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Listen for clicks anywhere on the document
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if the click is NOT on a pricing box
    if (!target.closest('.pricing-box1') &&
        !target.closest('.pricing-box2') &&
        !target.closest('.pricing-box3')) {
      this.selectedBox = null;  // Clear selection
    }
  }
}