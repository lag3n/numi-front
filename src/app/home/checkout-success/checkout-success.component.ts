import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserStateService } from '../../services/user-state.service';
import { AuthService, User } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout-success',
  template: `
    <div class="container mt-5 text-center">
      <div *ngIf="loading" class="mb-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2">Processing your payment...</p>
      </div>
      
      <div *ngIf="!loading">
        <h1 class="display-4 text-success">Payment Successful!</h1>
        <p class="lead">Thank you for your subscription.</p>
        <p>Your account has been credited with <strong>{{ creditsAdded }}</strong> credits.</p>
        <p>Your new balance is <strong>{{ currentCredits }}</strong> credits.</p>
        <button class="btn btn-primary mt-3" (click)="goToDetail()">Go to Dashboard</button>
      </div>
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
export class CheckoutSuccessComponent implements OnInit {
  sessionId: string | null = null;
  creditsAdded: number = 0;
  loading: boolean = false;
  error: boolean = false;
  currentCredits: number = 0;
  errorMessage: string = '';
  plan: string = 'Basic';
  priceId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userStateService: UserStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('CheckoutSuccessComponent initialized');
    // Get the session ID from URL params
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      console.log(`Session ID from URL: ${this.sessionId}`);
      if (this.sessionId) {
        this.loading = true;
        console.log('Starting session verification');
        this.verifySession();
      } else {
        console.error('No session ID found in URL parameters');
        this.errorMessage = 'No session ID found. Please try again.';
      }
    });
  }

  verifySession() {
    console.log(`Verifying session with ID: ${this.sessionId}`);
    // Use the correct Stripe server URL from environment
    this.http.post<any>(`${environment.stripeServerUrl}/verify-session`, {
      sessionId: this.sessionId
    }).subscribe({
      next: (response) => {
        console.log('Session verified with response:', response);
        if (response.success) {
          // Extract credits from response using the enhanced response format
          if (response.order) {
            // First try to use the credits directly from the response
            if (response.order.credits) {
              this.creditsAdded = response.order.credits;
              console.log(`Using credits from response: ${this.creditsAdded}`);
            } else {
              // Fall back to mapping the amount to credits
              const amount = response.order.amount_total / 100; // Convert from cents
              console.log(`Payment amount: $${amount}`);
              
              if (amount === 1000) {
                this.creditsAdded = 40; // Basic tier
                this.plan = 'Basic';
              } else if (amount === 2500) {
                this.creditsAdded = 80; // Pro tier
                this.plan = 'Pro';
              } else if (amount === 10000) {
                this.creditsAdded = 1000; // Business tier
                this.plan = 'Business';
              }
              console.log(`Determined plan from amount: ${this.plan}, credits to add: ${this.creditsAdded}`);
            }
            
            // Get tier name if available
            if (response.order.tier_name) {
              this.plan = response.order.tier_name;
              console.log(`Using tier name from response: ${this.plan}`);
            }
            
            // Get price ID if available
            if (response.order.price_id) {
              this.priceId = response.order.price_id;
              console.log(`Using price ID from response: ${this.priceId}`);
            }
          } 
          // Try to get current user
          this.getCurrentUser();
        } else {
          console.error('Session verification failed:', response);
          this.loading = false;
          this.errorMessage = 'Failed to verify your payment session. Please contact support.';
        }
      },
      error: (error) => {
        console.error('Session verification error:', error);
        this.loading = false;
        this.errorMessage = 'Error verifying your payment. Please contact support.';
      }
    });
  }

  getCurrentUser() {
    // Get the current user from AuthService (returns User | null directly, not an Observable)
    const currentUser: User | null = this.authService.getCurrentUser();

    if (currentUser && currentUser.email) {
      console.log('Current user found:', currentUser.email);
      // Directly update credits with the email from the current user
      this.directlyUpdateCredits(currentUser.email);
    } else {
      // Fallback to UserStateService if AuthService doesn't have the user
      const userState = this.userStateService.getUserState();
      if (userState && userState.email) {
        console.log('User found in UserStateService:', userState.email);
        this.directlyUpdateCredits(userState.email);
      } else {
        this.loading = false;
        this.error = true;
        console.error('No user found in either AuthService or UserStateService');
      }
    }
  }

  directlyUpdateCredits(userEmail: string) {
    console.log(`Directly updating credits for ${userEmail}, adding ${this.creditsAdded} credits`);

    // Determine the price ID to use - first try from the session response, then fallback to hardcoded values
    let priceId = this.priceId || 'price_1REkNAQqWiM8rPLDt6kYx6Xh'; // Default to Basic tier (40 credits)

    if (!this.priceId) {
      console.log('No price ID from session, using hardcoded values based on credits');
      if (this.creditsAdded === 80) {
        priceId = 'price_1REkanQqWiM8rPLDU9YKrHdC'; // Pro tier
      } else if (this.creditsAdded === 1000) {
        priceId = 'price_1REkbCQqWiM8rPLD0QY3yQ9z'; // Business tier
      }
    }
    
    // Try to make a direct credit update first to the Flask auth server
    console.log('First trying direct auth server credit update');
    this.http.post<any>(`${environment.authApiUrl}/api/credit-user`, {
      userEmail: userEmail,
      priceId: priceId,
      description: `${this.plan} Plan - ${this.creditsAdded} Credits`,
      creditsAmount: this.creditsAdded
    }).subscribe({
      next: (response) => {
        console.log('Auth API credit update response:', response);
        if (response && response.newBalance) {
          this.loading = false;
          this.currentCredits = response.newBalance;
          this.userStateService.updateUserCredits(this.currentCredits);
          
          // Force refresh user data
          this.authService.fetchCurrentUser().subscribe();
          
          // Add a delay before redirecting to ensure state is updated
          setTimeout(() => {
            this.router.navigateByUrl('/detail', { skipLocationChange: true });
          }, 2000);
          return; // Skip the Node.js API call if Flask call worked
        }
        // If we get here, the Flask API returned success but without proper data
        // Fall through to the Node.js API call
        this.tryNodeJsApiUpdate(userEmail, priceId);
      },
      error: (error) => {
        console.error('Auth API credit update failed, trying Node.js API:', error);
        // Fall back to Node.js API
        this.tryNodeJsApiUpdate(userEmail, priceId);
      }
    });
  }
  
  // Helper method to try Node.js API update if Flask update fails
  tryNodeJsApiUpdate(userEmail: string, priceId: string) {

    console.log(`Using price ID: ${priceId} for ${this.creditsAdded} credits (Node.js API fallback)`);

    // Additional info to help with fallback credit determination
    const requestData = {
      userEmail: userEmail,
      priceId: priceId,
      description: `${this.plan} Plan - ${this.creditsAdded} Credits`,
      creditsAmount: this.creditsAdded
    };

    console.log('Sending credit update request to Node.js API:', requestData);

    // Make 3 attempts to update credits via Node.js API
    this.makeCreditsUpdateRequest(requestData, 1);
  }

  // Helper method to retry credit updates
  makeCreditsUpdateRequest(requestData: any, attempt: number) {
    if (attempt > 3) {
      console.error('Failed to update credits after 3 attempts');
      
      // Last chance attempt: try calling directly to the auth API
      console.log('Attempting direct call to auth API as last resort');
      this.http.post<any>(`${environment.authApiUrl}/api/credit-user`, requestData).subscribe({
        next: (response) => {
          console.log('Direct auth API credit update response:', response);
          this.loading = false;
          this.currentCredits = response.newBalance || this.creditsAdded;
          this.userStateService.updateUserCredits(this.currentCredits);
          
          // Force refresh user data
          this.authService.fetchCurrentUser().subscribe();
        },
        error: (error) => {
          console.error('Direct auth API credit update failed:', error);
          this.loading = false;
          // Even if all API calls fail, still show the credits that would have been added
          this.currentCredits = this.creditsAdded;
          this.userStateService.updateUserCredits(this.creditsAdded);
        }
      });
      return;
    }

    console.log(`Credit update attempt ${attempt}/3`);

    // Call the backend to update credits
    this.http.post<any>(`${environment.apiUrl}/api/credit-user`, requestData).subscribe({
      next: (response) => {
        console.log(`Attempt ${attempt} credit update response:`, response);
        this.loading = false;
        this.currentCredits = response.newBalance || this.creditsAdded;

        // Update the user state with new credit balance
        this.userStateService.updateUserCredits(this.currentCredits);

        // Also update the AuthService user state to ensure it's consistent
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.credits = this.currentCredits;
          // Force a refresh of the current user data
          this.authService.fetchCurrentUser().subscribe(success => {
            console.log('User data refreshed after credit update:', success);
          });
        }

        // Add a delay before redirecting to ensure state is updated
        setTimeout(() => {
          console.log('Refreshing user state one more time before navigation');
          this.authService.fetchCurrentUser().subscribe(() => {
            // Force reload the detail page to ensure it shows the updated credits
            this.router.navigateByUrl('/detail', { skipLocationChange: true }).then(() => {
              console.log('Navigation to detail page with updated credits');
            });
          });
        }, 2000);
      },
      error: (error: any) => {
        console.error(`Attempt ${attempt} error updating user credits:`, error);
        
        if (attempt < 3) {
          console.log(`Retrying credit update (attempt ${attempt + 1})...`);
          // Wait a bit before retrying
          setTimeout(() => {
            this.makeCreditsUpdateRequest(requestData, attempt + 1);
          }, 1000);
        } else {
          this.loading = false;
          // Even if all API calls fail, still show the credits that would have been added
          this.currentCredits = this.creditsAdded;
          this.userStateService.updateUserCredits(this.creditsAdded);
          
          // Try to refresh the user data anyway
          this.authService.fetchCurrentUser().subscribe();
        }
      }
    });
  }

  goToDetail() {
    this.router.navigate(['/detail']);
  }
}
