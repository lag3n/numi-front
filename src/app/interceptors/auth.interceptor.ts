import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      // Clone the request with the token in the Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        // Add withCredentials to ensure cookies are sent with the request
        withCredentials: true
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if the error is a 401 or 403 
        if ((error.status === 401 || error.status === 403)) {
          // Don't immediately log out for deduct-credit endpoint
          // The component will handle token refresh for this endpoint
          if (request.url.includes('deduct-credit')) {
            return throwError(() => error);
          }
          
          // For other endpoints, try to refresh the token first
          // Only if that fails, then log out the user
          console.log('Auth error, attempting token refresh');
          // We need to retry the original request after token refresh
          this.authService.refreshToken().subscribe({
            next: (success) => {
              if (!success) {
                console.log('Token refresh failed, logging out user');
                this.authService.logout();
                this.router.navigate(['/login']);
              }
            },
            error: () => {
              console.log('Token refresh failed, logging out user');
              this.authService.logout();
              this.router.navigate(['/login']);
            }
          });
          
          // Return the original error
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }
}
