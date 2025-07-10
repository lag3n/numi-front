import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing your login...</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f8f9fa;
    }
    
    .loading-spinner {
      text-align: center;
    }
    
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #007bff;
      animation: spin 1s ease-in-out infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  private apiUrl = environment.authApiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Extract authorization code from URL
    this.route.queryParams.subscribe(params => {
      // Check for errors from Google
      if (params['error']) {
        console.error('Google OAuth error:', params['error']);
        this.router.navigate(['/login'], { 
          queryParams: { 
            error: 'google_auth_failed', 
            message: params['error'] 
          } 
        });
        return;
      }

      const code = params['code'];
      const state = params['state'];
      
      // Verify the state to prevent CSRF attacks
      const savedState = localStorage.getItem('oauth_state');
      localStorage.removeItem('oauth_state'); // Clear the saved state
      
      if (!code) {
        console.error('No authorization code received');
        this.router.navigate(['/login'], { 
          queryParams: { 
            error: 'no_code', 
            message: 'No authorization code received from Google' 
          } 
        });
        return;
      }
      
      if (state !== savedState) {
        console.error('State mismatch, possible CSRF attack');
        this.router.navigate(['/login'], { 
          queryParams: { 
            error: 'state_mismatch', 
            message: 'Security verification failed' 
          } 
        });
        return;
      }
      
      // Send the code to the backend to exchange for tokens
      this.http.post(`${this.apiUrl}/api/auth/google/callback`, { code })
        .subscribe({
          next: (response: any) => {
            // Store user data and token
            if (response.token && response.user) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));
              
              // Update the auth service
              this.authService.updateCurrentUser(response.user);
              
              // Navigate to the return URL or home
              const returnUrl = localStorage.getItem('returnUrl') || '/';
              localStorage.removeItem('returnUrl');
              this.router.navigateByUrl(returnUrl);
            } else {
              console.error('Invalid response from server', response);
              this.router.navigate(['/login'], { 
                queryParams: { 
                  error: 'invalid_response', 
                  message: 'Invalid response from server' 
                } 
              });
            }
          },
          error: (error) => {
            console.error('Error exchanging code for token:', error);
            this.router.navigate(['/login'], { 
              queryParams: { 
                error: 'token_exchange_failed', 
                message: error.message || 'Failed to complete authentication' 
              } 
            });
          }
        });
    });
  }
}
