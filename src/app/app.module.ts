import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared/shared.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { AppComponent } from './app.component';
import { HomeComponent } from './general/home/home.component';
import { ErrorComponent } from './general/error/error.component';
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { UserDashboardComponent } from './meeting/user-dashboard/user-dashboard.component';
import { UserSelectionComponent } from './meeting/user-selection/user-selection.component';
import { AdminDashboardComponent } from './meeting/admin-dashboard/admin-dashboard.component';
import { SocketService } from './socket.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ErrorComponent,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserDashboardComponent,
    UserSelectionComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgbModalModule,
    NgbTooltipModule,
    Ng2SearchPipeModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'not-found', component: ErrorComponent },
      { path: 'server-error/:error', component: ErrorComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:authToken/:userId', component: ResetPasswordComponent },
      { path: 'user-dashboard', component: UserDashboardComponent },
      { path: 'user-selection', component: UserSelectionComponent },
      { path: 'admin-dashboard/:participantId', component: AdminDashboardComponent },
      { path: '*', component: ErrorComponent },
      { path: '**', component: ErrorComponent }
    ])
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
