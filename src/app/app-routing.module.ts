import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomepageComponent } from './home/welcomepage/welcomepage.component';
import { DetailpageComponent } from './home/detailpage/detailpage.component';
import { AnalyticsComponent } from './home/analytics/analytics.component';
import { HowItWorksComponent } from './home/how-it-works/how-it-works.component';
import { ContactUsComponent } from './home/contact-us/contact-us.component';
import { UserAccessComponent } from './admin/user-access/user-access.component';
import { PricingComponent } from './home/pricing/pricing.component';
import { TrialpageComponent } from './home/trialpage/trialpage.component';
import { CheckoutSuccessComponent } from './home/checkout-success/checkout-success.component';
import { CheckoutCancelComponent } from './home/checkout-cancel/checkout-cancel.component';

// Auth Components
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { GoogleCallbackComponent } from './auth/google-callback/google-callback.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomepageComponent },
  { path: 'detail', component: DetailpageComponent, canActivate: [AuthGuard] },
  { path: 'trial', component: TrialpageComponent },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'admin/user-access', component: UserAccessComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'success', component: CheckoutSuccessComponent, canActivate: [AuthGuard] },
  { path: 'cancel', component: CheckoutCancelComponent },
  // Google OAuth callback route
  { path: 'auth/google/callback', component: GoogleCallbackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 