// welcomepage.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TopcontainerComponent } from '../../components/topcontainer/topcontainer.component';
import { BottomcontainerComponent } from '../../components/bottomcontainer/bottomcontainer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-welcomepage',
  // standalone: true,
  // imports: [
  //   CommonModule, 
  //   NgbCarouselModule,
  //   RouterModule,
  //   TopcontainerComponent,
  //   BottomcontainerComponent
  // ],
  templateUrl: './welcomepage.component.html',
  styleUrl: './welcomepage.component.scss'
})
export class WelcomepageComponent {
  constructor(private router: Router, private authService: AuthService) {}

  coinImages = [
    { src: 'assets/welcome-coin1.jpg', title: 'Coin Front', desc: 'Detailed view of the coin front' },
    { src: 'assets/welcome-coin2.jpg', title: 'Coin Back', desc: 'Detailed view of the coin back' }
  ];

  navigateToDetail() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/detail']);
    } else {
      this.router.navigate(['/trial']);
    }
  }

  navigateToUserAccess() {
    this.router.navigate(['/admin/user-access']);
  }
}