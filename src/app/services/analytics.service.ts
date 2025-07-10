import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IpTrackingResponse {
  uniqueIPs: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly STORAGE_KEY = 'startButtonClicks';
  private readonly IP_TRACKING_URL = 'http://localhost:8080/analytics/track-ip';

  constructor(private http: HttpClient) { }

  incrementButtonClicks(): void {
    if (typeof window !== 'undefined') {
      const currentClicks = this.getButtonClicks();
      localStorage.setItem(this.STORAGE_KEY, (currentClicks + 1).toString());
      this.trackIP();
    }
  }

  getButtonClicks(): number {
    if (typeof window !== 'undefined') {
      const clicks = localStorage.getItem(this.STORAGE_KEY);
      return clicks ? parseInt(clicks) : 0;
    }
    return 0;
  }

  public trackIP(): void {
    // IP tracking disabled to prevent connection errors
    console.log('IP tracking disabled');
    // Simulate successful tracking to prevent errors
    localStorage.setItem('uniqueIPCount', '0');
    // Original implementation commented out:
    /*
    console.log('Attempting to track IP...');
    this.http.get<IpTrackingResponse>(this.IP_TRACKING_URL).subscribe({
      next: (response) => {
        console.log('Successfully tracked IP:', response);
        localStorage.setItem('uniqueIPCount', response.uniqueIPs.toString());
      },
      error: (error) => {
        console.error('Failed to track IP:', error);
      }
    });
    */
  }

  getUniqueIPCount(): number {
    if (typeof window !== 'undefined') {
      const count = localStorage.getItem('uniqueIPCount');
      return count ? parseInt(count) : 0;
    }
    return 0;
  }
} 