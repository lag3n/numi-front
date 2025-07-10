import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  username: string;
  credits: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authApiUrl = environment.authApiUrl; // Use the Flask authentication API URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        this.currentUserSubject.next(JSON.parse(userData));
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    // Send as JSON instead of FormData
    const userData = {
      email: email,
      password: password
    };

    return this.http.post(`${this.authApiUrl}/api/auth/login`, userData).pipe(
      tap((response: any) => {
        if (response.access_token && response.user && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  register(email: string, password: string, username: string): Observable<any> {
    // Send as JSON instead of FormData
    const userData = {
      email: email,
      password: password,
      username: username
    };

    return this.http.post(`${this.authApiUrl}/api/auth/register`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }
  
  /**
   * Attempts to refresh the user's authentication token
   * This can be called when a 401 is received but we don't want to log the user out
   */
  refreshToken(): Observable<boolean> {
    // If we have a refresh token mechanism on the backend, we would use it here
    // For now, we'll just try to fetch the current user which should refresh the token if valid
    return this.fetchCurrentUser().pipe(
      tap(success => {
        console.log('Token refresh attempt result:', success ? 'success' : 'failed');
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  /**
   * Checks if the user is currently logged in
   * @returns true if the user is logged in, false otherwise
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated() && !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  // Update the current user in the service
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  checkAndDeductCredit(): Observable<boolean> {
    const user = this.getCurrentUser();
    if (!user) {
      return new Observable(subscriber => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    return this.http.post<{success: boolean, user: User}>(`${this.authApiUrl}/api/auth/deduct-credit`, {}).pipe(
      tap(response => {
        if (response.success && response.user) {
          // Update stored user data with new credit count
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.currentUserSubject.next(response.user);
        }
      }),
      map(response => response.success)
    );
  }
  
  /**
   * Initiates Google OAuth login by redirecting to the backend's Google auth endpoint
   */
  loginWithGoogle(): void {
    if (isPlatformBrowser(this.platformId)) {
      // TEMPORARILY USE DIRECT LOGIN INSTEAD OF OAUTH REDIRECT DUE TO REDIRECT_URI_MISMATCH ERRORS
      const email = prompt('Enter your Google email to login:', '');
      if (email) {
        this.directGoogleLogin(email);
      } else {
        console.log('Google login canceled by user');
      }
      
      // OLD OAUTH REDIRECT METHOD - CURRENTLY BROKEN
      // Store the current URL to redirect back after login
      // localStorage.setItem('redirectAfterLogin', this.router.url);
      // Redirect to the backend Google auth endpoint
      // window.location.href = `${this.authApiUrl}/auth/google`;
    }
  }
  
  /**
   * Direct Google login method to bypass OAuth issues
   * This is a temporary workaround until the OAuth redirect_uri_mismatch is fixed
   */
  directGoogleLogin(email: string): void {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    console.log(`Attempting direct Google login with: ${email}`);
    
    // Store the current URL to redirect back after login
    const currentUrl = this.router.url;
    localStorage.setItem('redirectAfterLogin', currentUrl);
    
    // Call our new direct login endpoint
    this.http.post(`${this.authApiUrl}/auth/google-direct`, { email }).subscribe({
      next: (response: any) => {
        console.log('Direct Google login successful:', response);
        
        if (response.token && response.user) {
          // Store user data and token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          
          // Redirect to the stored URL or default to home
          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          
          // Check if there's a pending subscription to process
          const pendingSubscription = localStorage.getItem('pendingSubscription');
          if (pendingSubscription) {
            console.log('Found pending subscription after login, redirecting to pricing');
            this.router.navigate(['/pricing']);
          } else {
            console.log(`Redirecting to: ${redirectUrl}`);
            this.router.navigateByUrl(redirectUrl);
          }
        }
      },
      error: (error: any) => {
        console.error('Direct Google login failed:', error);
        alert('Login failed. Please try again.');
      }
    });
  }
  
  /**
   * Process Google Sign-In information from the client-side API
   * This handles the result from the Google Sign-In button
   */
  handleGoogleSignIn(email: string, idToken: string, profile: any): Observable<any> {
    console.log(`Processing Google Sign-In for ${email}`);
    
    // Store current URL for redirect after login
    const currentUrl = this.router.url;
    localStorage.setItem('redirectAfterLogin', currentUrl);
    
    // Send the ID token to our backend to verify and create/login the user
    return this.http.post(`${this.authApiUrl}/auth/google-verify-token`, {
      email,
      idToken,
      name: profile.getName(),
      imageUrl: profile.getImageUrl()
    }).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          console.log('Google Sign-In successful with backend:', response);
          
          // Store user data and token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }
  
  /**
   * Handles the redirect from Google OAuth
   * Call this method in components that might be the target of OAuth redirects
   */
  handleAuthRedirect(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get('login');
      const token = urlParams.get('token');
      const source = urlParams.get('source');
      const email = urlParams.get('email');
      const userId = urlParams.get('user_id');
      
      console.log('Checking for OAuth redirect parameters...');
      
      if (loginSuccess === 'success') {
        console.log(`Login success detected! Source: ${source || 'unknown'}`);
        
        // If token is provided in URL, store it
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token received from OAuth redirect and stored');
          
          // If we have user info directly in the URL (from Google OAuth)
          if (source === 'google' && email && userId) {
            console.log(`Direct user info from Google OAuth: ${email} (ID: ${userId})`);
            
            // We could construct a user object here, but better to fetch from backend
            // to ensure we have the latest data (credits, etc.)
          }
        }
        
        // Fetch current user data from the backend to ensure we have the latest
        return this.fetchCurrentUser().pipe(
          map(success => {
            if (success) {
              console.log('Successfully fetched user data after OAuth login');
              
              // Clear URL parameters
              this.router.navigate([], {
                queryParams: { 
                  login: null, 
                  token: null,
                  source: null,
                  email: null,
                  user_id: null 
                },
                queryParamsHandling: 'merge'
              });
              
              // Redirect to the stored URL or default to home page
              const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
              localStorage.removeItem('redirectAfterLogin');
              
              // Check if there's a pending subscription to process
              const pendingSubscription = localStorage.getItem('pendingSubscription');
              if (pendingSubscription) {
                console.log('Found pending subscription after login, redirecting to pricing');
                this.router.navigate(['/pricing']);
              } else {
                console.log(`Redirecting to: ${redirectUrl}`);
                this.router.navigateByUrl(redirectUrl);
              }
              return true;
            }
            console.log('Failed to fetch user data after OAuth login');
            return false;
          })
        );
      }
    }
    return of(false);
  }
  
  /**
   * Fetches the current user data from the backend
   */
  fetchCurrentUser(): Observable<boolean> {
    return this.http.get<{user: User}>(`${this.authApiUrl}/api/user/current`).pipe(
      tap(response => {
        if (response && response.user) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.currentUserSubject.next(response.user);
        }
      }),
      map(response => !!response.user),
      // If there's an error (e.g., not logged in), return false
      tap(null, () => {
        this.currentUserSubject.next(null);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      })
    );
  }
}
