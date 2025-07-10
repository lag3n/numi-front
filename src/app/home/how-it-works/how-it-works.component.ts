import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TopcontainerComponent } from '../../components/topcontainer/topcontainer.component';
import { BottomcontainerComponent } from '../../components/bottomcontainer/bottomcontainer.component';
import { OnInit} from '@angular/core';
@Component({
  selector: 'app-how-it-works',
  //standalone: true,
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent implements OnInit {
  beforeAfterPairs = [
    { before: "/assets/before1.png", after: "/assets/after1.png"},
    { before: "/assets/before2.png", after: "/assets/after2.png"},
    { before: "/assets/before3.png", after: "/assets/after3.png"}
  ]

  currentIndex = 0;
 ngOnInit() {
  setInterval(() => {
    this.nextSlide();
  }, 4000); 
 }

  prevSlide() {
    if (this.currentIndex === 0 ) {
      this.currentIndex = this.beforeAfterPairs.length - 1;
    } else {
    this.currentIndex--;
    }
    console.log('Now showing:', this.beforeAfterPairs[this.currentIndex]);
  }  
  
  nextSlide() {
    if (this.currentIndex === this.beforeAfterPairs.length - 1) {
      this.currentIndex = 0;
    console.log('Next Slide');
    } else {
      this.currentIndex ++;
      console.log('Now showing: ', this. beforeAfterPairs[this.currentIndex]);
    }
}
}
