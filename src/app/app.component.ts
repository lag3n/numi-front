import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'NumisPics';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Check for OAuth redirects (Google login)
    this.authService.handleAuthRedirect().subscribe(success => {
      if (success) {
        console.log('Successfully handled OAuth redirect');
      }
    });
    
    // Check if user is already authenticated
    if (this.authService.isLoggedIn()) {
      console.log('User is already logged in');
      // Refresh user data to ensure we have the latest
      this.authService.fetchCurrentUser().subscribe();
    }
  }
}
