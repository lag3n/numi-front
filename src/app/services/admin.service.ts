import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAdmin, UserAdminResponse, CreditUpdateRequest, SubscriptionUpdateRequest } from '../models/user-admin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private authApiUrl = environment.authApiUrl; // Use the Flask authentication API URL

  constructor(private http: HttpClient) { }

  /**
   * Get all users from the database
   */
  getAllUsers(): Observable<UserAdminResponse> {
    return this.http.get<UserAdminResponse>(`${this.authApiUrl}/api/admin/users`);
  }

  /**
   * Update a user's credit balance
   * @param userId The user's ID
   * @param credits The new credit balance
   */
  updateUserCredits(userId: number, credits: number): Observable<UserAdmin> {
    const request: CreditUpdateRequest = { userId, credits };
    return this.http.post<UserAdmin>(`${this.authApiUrl}/api/admin/update-credits`, request);
  }

  /**
   * Update a user's subscription plan
   * @param userId The user's ID
   * @param subscriptionPlan The new subscription plan
   */
  updateUserSubscription(userId: number, subscriptionPlan: string): Observable<UserAdmin> {
    const request: SubscriptionUpdateRequest = { userId, subscriptionPlan };
    return this.http.post<UserAdmin>(`${this.authApiUrl}/api/admin/update-subscription`, request);
  }
}
