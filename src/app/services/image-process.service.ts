import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';


interface ProcessedImages {
  status: string; message: string;
  files: { front: ImageFile; back: ImageFile; composite: ImageFile; };
}
interface ImageFile { filename: string; content: string; content_type: string; }

interface MarginOptions {
  inner_margin: number;
  outer_margin: number;
  vertical_margin: number;
}

@Injectable({ providedIn: 'root' })
export class ImageProcessService {

  private apiUrl_Local = environment.imageApiUrl; // Use the FastAPI URL from environment
  // private apiUrl_Local = 'https://10.0.0.176:8800';
  private apiUrl_Prod = 'https://topcode.ca:8800';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  // Flag to track if credit has already been deducted in this session
  private creditDeducted = false;

  processImages(frontImage: File, backImage: File, options?: MarginOptions): Observable<any> {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);
    
    // Get auth token from localStorage for authenticated requests
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Accept': '*/*',
      // Add Authorization header if token exists
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
    
    const httpOptions = { withCredentials: true, headers };
    const apiUrl = this.getApiUrl();

    if (options) {
      console.log('Margins:', options);
      formData.append('inner_margin', options.inner_margin.toString());
      formData.append('outer_margin', options.outer_margin.toString());
      formData.append('vertical_margin', options.vertical_margin.toString());
    }

    // Reset credit deduction flag at the start of a new processing request
    this.creditDeducted = false;

    // First deduct a credit before processing
    return this.deductCredit().pipe(
      switchMap(deductResponse => {
        console.log('Credit deducted successfully:', deductResponse);
        // Set flag to indicate credit has been deducted
        this.creditDeducted = true;
        
        // Get the token for the image processing request
        const token = localStorage.getItem('token');
        if (token) {
          // Update headers with the token for the image processing request
          httpOptions.headers = httpOptions.headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Then process the images
        return this.http.post<ProcessedImages>(`${apiUrl}/upload-and-process`, formData, httpOptions);
      }),
      tap(response => console.log('Image processing response:', response)),
      catchError(error => {
        console.error('Processing error:', error);
        
        // Check if this is a CORS error
        if (error.status === 0) {
          console.error('This appears to be a CORS error in image processing. Check server configuration.');
          return throwError(() => ({ 
            type: 'CORS_ERROR', 
            message: 'CORS error when processing images. Check server configuration.' 
          }));
        }
        
        // If it's an authentication error
        if (error.status === 401 || error.status === 403) {
          console.error('Authentication error when processing images.');
          return throwError(() => ({ 
            type: 'AUTH_ERROR', 
            message: 'Authentication error when processing images' 
          }));
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Process images for trial users without authentication or credit deduction
   * Uses the trial endpoint that applies watermarks and reduces resolution
   */
  processTrialImages(frontImage: File, backImage: File, options?: MarginOptions): Observable<any> {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);
    
    const httpOptions = { withCredentials: true };
    const apiUrl = this.getApiUrl();

    if (options) {
      console.log('Trial processing with margins:', options);
      formData.append('inner_margin', options.inner_margin.toString());
      formData.append('outer_margin', options.outer_margin.toString());
      formData.append('vertical_margin', options.vertical_margin.toString());
    }
    
    // Use the trial endpoint directly without authentication
    const imageApiUrl = environment.imageApiUrl;
    console.log('Using trial endpoint:', `${imageApiUrl}/trial/upload-and-process`);
    return this.http.post<any>(`${imageApiUrl}/trial/upload-and-process`, formData, httpOptions).pipe(
      tap(response => console.log('Trial processing response:', response)),
      catchError(error => {
        console.error('Trial processing error:', error);
        
        // Check if this is a CORS error
        if (error.status === 0) {
          console.error('This appears to be a CORS error in trial processing. Check server configuration.');
          return throwError(() => ({ 
            type: 'CORS_ERROR', 
            message: 'CORS error when processing trial images. Check server configuration.' 
          }));
        }
        
        return throwError(() => error);
      })
    );
  }
  
  testUpload(frontImage: File): Observable<any> {
    
    const formData = new FormData();
    formData.append('file', frontImage);

    const httpOptions = { withCredentials: true };
    const apiUrl = this.getApiUrl();
    return this.http.post(`${apiUrl}/test-upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
        tap(event => {
            if (event.type === HttpEventType.UploadProgress) {
                console.log(`Upload progress: ${Math.round(100 * (event.loaded / (event.total || 1)))}%`);
            }
        }),
        catchError(error => {
            console.error('Upload error:', error);
            return throwError(() => error);
        })
    );
    }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  combineImages(frontImage: any, backImage: any, options: any): Observable<any> {
    const formData = new FormData();
    
    // Convert base64 to Blob and append to FormData
    const frontBlob = this.base64ToBlob(frontImage.content, frontImage.content_type);
    const backBlob = this.base64ToBlob(backImage.content, backImage.content_type);
    
    formData.append('front_image', frontBlob, 'front.png');
    formData.append('back_image', backBlob, 'back.png');
    formData.append('inner_margin', options.inner_margin.toString());
    formData.append('outer_margin', options.outer_margin.toString());
    formData.append('vertical_margin', options.vertical_margin.toString());

    const apiUrl = this.getApiUrl();
    return this.http.post<any>(`${apiUrl}/combine`, formData, { withCredentials: true });
  }

  swapImages(frontImage: any, backImage: any, options: any): Observable<any> {
    const formData = new FormData();
    
    // Convert base64 to Blob and append to FormData
    const frontBlob = this.base64ToBlob(frontImage.content, frontImage.content_type);
    const backBlob = this.base64ToBlob(backImage.content, backImage.content_type);
    
    // Note: We're NOT swapping the files here - the server will do the swapping
    // Just send them in their original order
    formData.append('front_image', frontBlob, 'front.png');
    formData.append('back_image', backBlob, 'back.png');
    formData.append('inner_margin', options.inner_margin.toString());
    formData.append('outer_margin', options.outer_margin.toString());
    formData.append('vertical_margin', options.vertical_margin.toString());

    const apiUrl = this.getApiUrl();
    console.log('Calling swap endpoint:', `${apiUrl}/swap`);

    return this.http.post<any>(`${apiUrl}/swap`, formData, { withCredentials: true });
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
  
  /**
   * Deducts a credit from the user's account before processing images
   * This ensures the user has enough credits and handles the deduction
   */
  private deductCredit(): Observable<any> {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return throwError(() => new Error('Authentication required'));
    }
    
    // If credit has already been deducted in this session, return success without making another API call
    if (this.creditDeducted) {
      console.log('Credit already deducted in this session, skipping deduction');
      return new Observable(subscriber => {
        subscriber.next({ success: true, message: 'Credit already deducted' });
        subscriber.complete();
      });
    }
    
    // Set up headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Use withCredentials: true to ensure cookies are sent with the request
    const options = {
      headers: headers,
      withCredentials: true
    };
    
    console.log('Sending deduct credit request to:', `${environment.authApiUrl}/api/auth/deduct-credit`);
    console.log('With token:', token.substring(0, 10) + '...');
    
    // Make the API call with proper error handling
    return this.http.post(`${environment.authApiUrl}/api/auth/deduct-credit`, {}, options).pipe(
      tap(response => {
        console.log('Credit deduction response:', response);
      }),
      catchError(error => {
        console.error('Credit deduction error:', error);
        
        // Check if this is a CORS error
        if (error.status === 0) {
          console.error('This appears to be a CORS error. Check that your server is properly configured for CORS.');
          return throwError(() => ({ 
            type: 'CORS_ERROR', 
            message: 'CORS error when deducting credits. Check server configuration.' 
          }));
        }
        
        // If it's a 401 error, it might be because the token is invalid or expired
        if (error.status === 401) {
          console.error('Authentication error when deducting credits. Token may be invalid.');
          // Return a specific error object that the component can handle
          return throwError(() => ({ 
            type: 'AUTH_ERROR', 
            message: 'Authentication error when deducting credits' 
          }));
        }
        
        // For all other errors
        return throwError(() => ({
          type: 'API_ERROR',
          message: error.error?.detail || error.message || 'Unknown error occurred',
          originalError: error
        }));
      })
    );
  }
}
