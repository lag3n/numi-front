import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  buttonClicks: number = 0;
  uniqueIPCount: number = 0;

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit() {
    console.log('AnalyticsComponent initialized');
    this.loadData();
    // Call trackIP on component initialization
    this.analyticsService.trackIP();
  }

  private loadData() {
    this.buttonClicks = this.analyticsService.getButtonClicks();
    this.uniqueIPCount = this.analyticsService.getUniqueIPCount();
    console.log('Loaded data:', { buttonClicks: this.buttonClicks, uniqueIPCount: this.uniqueIPCount });
  }
} 