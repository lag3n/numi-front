import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { DetailpageComponent } from './detailpage/detailpage.component';
import { TrialpageComponent } from './trialpage/trialpage.component';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';
import { CheckoutCancelComponent } from './checkout-cancel/checkout-cancel.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { PricingComponent } from './pricing/pricing.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AnalyticsComponent } from './analytics/analytics.component';

// Shared components
import { TopcontainerComponent } from '../components/topcontainer/topcontainer.component';
import { BottomcontainerComponent } from '../components/bottomcontainer/bottomcontainer.component';

@NgModule({
  declarations: [
    WelcomepageComponent,
    DetailpageComponent,
    TrialpageComponent,
    CheckoutSuccessComponent,
    CheckoutCancelComponent,
    HowItWorksComponent,
    PricingComponent,
    ContactUsComponent,
    AnalyticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbModule,
    TopcontainerComponent,
    BottomcontainerComponent
  ],
  exports: [
    WelcomepageComponent,
    DetailpageComponent,
    TrialpageComponent,
    CheckoutSuccessComponent,
    CheckoutCancelComponent,
    HowItWorksComponent,
    PricingComponent,
    ContactUsComponent,
    AnalyticsComponent
  ]
})
export class HomeModule { }
