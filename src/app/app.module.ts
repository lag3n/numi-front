import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomepageComponent } from './home/welcomepage/welcomepage.component';
import { DetailpageComponent } from './home/detailpage/detailpage.component';

import { SharedModule } from './components/shared.module';

import { AnalyticsComponent } from './home/analytics/analytics.component';
import { UserAccessComponent } from './admin/user-access/user-access.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GridModule } from '@progress/kendo-angular-grid';
import { HowItWorksComponent } from './home/how-it-works/how-it-works.component';
import { ContactUsComponent } from './home/contact-us/contact-us.component';
import { PricingComponent } from './home/pricing/pricing.component';
import { CheckoutSuccessComponent } from './home/checkout-success/checkout-success.component';
import { CheckoutCancelComponent } from './home/checkout-cancel/checkout-cancel.component';
import { TrialpageComponent } from './home/trialpage/trialpage.component';

// Auth Components
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent, 
    WelcomepageComponent, 
    DetailpageComponent, 
    AnalyticsComponent, 
    UserAccessComponent, 
    HowItWorksComponent, 
    ContactUsComponent, 
    PricingComponent,
    CheckoutSuccessComponent,
    CheckoutCancelComponent,
    TrialpageComponent
  ],
  imports: [
    BrowserModule, 
    AppRoutingModule, 
    FormsModule, 
    HttpClientModule, 
    NgbModule, 
    GridModule, 
    BrowserAnimationsModule,
    LoginComponent,
    SignupComponent,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 