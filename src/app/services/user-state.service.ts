import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface UserState {
  email: string | null;
  isLoggedIn: boolean;
  credits?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private userState = new BehaviorSubject<UserState>({
    email: null,
    isLoggedIn: false,
    credits: 0
  });

  user$ = this.userState.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          this.userState.next(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
  }

  setUser(email: string, credits: number = 0): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const newState = { email, isLoggedIn: true, credits };
        localStorage.setItem('user', JSON.stringify(newState));
        this.userState.next(newState);
      } catch (error) {
        console.error('Error setting user in localStorage:', error);
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error removing user from localStorage:', error);
      }
    }
    this.userState.next({
      email: null,
      isLoggedIn: false,
      credits: 0
    });
  }

  getUserState(): UserState {
    return this.userState.value;
  }

  isLoggedIn(): boolean {
    return this.userState.value.isLoggedIn;
  }

  getCurrentUser(): UserState | null {
    return this.isLoggedIn() ? this.userState.value : null;
  }

  updateUserCredits(credits: number): void {
    if (isPlatformBrowser(this.platformId) && this.isLoggedIn()) {
      try {
        const currentState = this.userState.value;
        const newState = { ...currentState, credits };
        localStorage.setItem('user', JSON.stringify(newState));
        this.userState.next(newState);
      } catch (error) {
        console.error('Error updating user credits in localStorage:', error);
      }
    }
  }
}
