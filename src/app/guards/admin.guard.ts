import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private readonly ADMIN_PASSWORD = 'JDpz2025$';
  
  constructor(private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the user has already entered the correct password in this session
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    
    if (isAuthenticated) {
      return true;
    }
    
    // Prompt for password
    const enteredPassword = prompt('Please enter the admin password:');
    
    if (enteredPassword === this.ADMIN_PASSWORD) {
      // Store authentication status in localStorage for this session
      localStorage.setItem('adminAuthenticated', 'true');
      return true;
    } else {
      alert('Incorrect password. Access denied.');
      this.router.navigate(['/']);
      return false;
    }
  }
}
