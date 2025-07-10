import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserAccess } from '../models/userAccess.model'; 
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class UserProcessService {

  private apiUrl_Local = 'https://localhost:7073/api'; // call local webapi
  private apiUrl_Prod = 'https://www.numispics.com/bydToken/api';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  logUserAccess(): Observable<any> {    
    const apiUrl = this.getApiUrl();
    return this.http.get(`${apiUrl}/login/LogUserAccess`);
  }

  loadUserAccessList(): Observable<UserAccess> {
    const apiUrl = this.getApiUrl();
    return this.http.get<any>(`${apiUrl}/login/LoadUserAccessingList`);
  }

  private getApiUrl(): string {
    // Get current hostname
    const hostname = this.document.location.hostname;
    
    // Check if we're on local network or production
    if (hostname.includes('localhost') || hostname.startsWith('10.0.0.')) {
        return this.apiUrl_Local;
    } else {
        return this.apiUrl_Prod;
    }
  }
}
