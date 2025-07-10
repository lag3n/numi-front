import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserStateService } from '@services/user-state.service';
import { StripeService } from '@services/stripe.service';

// No Google API declarations needed for standard OAuth flow

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="logo-container">
        <img src="assets/numispics-logo.png" alt="NumisPics Logo" class="logo">
      </div>
      
      <div class="login-form">
        <h2 class="login-title">Log in to your account</h2>
        <p *ngIf="pendingSubscription" class="subscription-notice">
          Please log in to continue with your subscription purchase.
        </p>
        
        <form (ngSubmit)="onSubmit()">
          <div class="input-group">
            <input 
              type="email" 
              placeholder="Email" 
              class="text-input"
              [(ngModel)]="email"
              name="email"
              required
            >
          </div>
          <div class="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              class="text-input"
              [(ngModel)]="password"
              name="password"
              required
            >
          </div>
          <button type="submit" class="login-button">Login</button>
        </form>
        
        <div class="divider">
          <span>OR</span>
        </div>
        
        <!-- Regular Google button (as backup) -->
        <button (click)="loginWithGoogle()" class="google-button">
          <img src="assets/google-logo.png" alt="Google" class="google-icon">
          Login with Google
        </button>
        
        <!-- We're not using the Google Sign-In API button anymore -->
        
        <p class="signup-link">
          Don't have an account? <a [routerLink]="['/signup']">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 450px;
      margin: 0 auto;
      padding: 30px 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .logo-container {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
    }
    
    .login-form {
      width: 100%;
      padding: 20px 0;
    }
    
    .login-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
      color: #333;
    }
    
    .subscription-notice {
      background-color: #f8f9fa;
      border-left: 4px solid #007bff;
      padding: 10px 15px;
      margin-bottom: 20px;
      color: #333;
      font-size: 14px;
    }
    
    .input-group {
      margin-bottom: 15px;
    }
    
    .text-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .login-button {
      width: 100%;
      padding: 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 15px;
      transition: background-color 0.3s;
    }
    
    .login-button:hover {
      background-color: #0069d9;
    }
    
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 20px 0;
    }
    
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #ccc;
    }
    
    .divider span {
      padding: 0 10px;
      color: #777;
      font-size: 14px;
    }
    
    .google-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px;
      background-color: white;
      color: #444;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    
    .google-button:hover {
      background-color: #f5f5f5;
    }
    
    .google-icon {
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
    
    .signup-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
    
    .signup-link a {
      color: #007bff;
      text-decoration: none;
    }
    
    .signup-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  pendingSubscription: string | null = null;
  returnUrl: string = '/';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userStateService: UserStateService,
    private stripeService: StripeService,
    private ngZone: NgZone
  ) {
    // Check if this is a redirect from Google OAuth
    this.authService.handleAuthRedirect().subscribe();
  }

  ngOnInit() {
    // Check if there's a pending subscription in localStorage
    this.pendingSubscription = localStorage.getItem('pendingSubscription');
    
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // If user is already logged in, redirect to return URL
    if (this.authService.isLoggedIn()) {
      this.handlePostLoginNavigation();
    }
  }
  
  ngAfterViewInit() {
    // No Google API initialization needed for standard OAuth flow
  }
  
  // Standard OAuth flow doesn't need a Google API loader

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          // Handle post-login navigation (including pending subscription)
          this.handlePostLoginNavigation();
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }
  
  loginWithGoogle() {
    // Store return URL for after login redirection
    if (this.returnUrl && this.returnUrl !== '/') {
      localStorage.setItem('returnUrl', this.returnUrl);
    }
    
    // Use standard OAuth 2.0 flow - this is the cleaner approach that Google recommends
    // This redirects the user to Google's authorization page directly
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    // Generate a random state parameter for security
    const state = this.generateRandomState();
    localStorage.setItem('oauth_state', state);
    
    // Build the authorization URL with all required parameters
    const params = new URLSearchParams({
      client_id: '658364746524-5q58l2mcv9o6aj7ssb8iq6v8j4grrvme.apps.googleusercontent.com',
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'email profile openid',
      prompt: 'select_account',  // Force account selection to avoid auto-selecting one account
      state: state
    });
    
    // Redirect the user to Google's auth page
    window.location.href = `${oauth2Endpoint}?${params.toString()}`;
  }
  
  /**
   * Generates a random state parameter for OAuth security
   */
  private generateRandomState(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // We don't need the handleGoogleSignIn method anymore as we're using standard OAuth
  
  /**
   * Handles navigation after successful login, including processing pending subscriptions
   */
  private handlePostLoginNavigation() {
    // Check if there's a pending subscription
    if (this.pendingSubscription) {
      console.log('Processing pending subscription:', this.pendingSubscription);
      
      // Get the current user
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        // Clear the pending subscription from localStorage
        localStorage.removeItem('pendingSubscription');
        
        // Redirect to pricing page to complete the subscription
        this.router.navigate(['/pricing']);
        return;
      }
    }
    
    // If no pending subscription, navigate to the return URL
    this.router.navigate([this.returnUrl]);
  }
}
