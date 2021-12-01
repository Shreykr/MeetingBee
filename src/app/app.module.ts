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
// import { HomeComponent } from './general/home/home.component';
// import { ErrorComponent } from './error/error.component';
//import { LoginComponent } from './user/login/login.component';
// import { SignupComponent } from './user/signup/signup.component';
// import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
// import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { UserDashboardComponent } from './meeting/user-dashboard/user-dashboard.component';
import { UserSelectionComponent } from './meeting/user-selection/user-selection.component';
import { AdminDashboardComponent } from './meeting/admin-dashboard/admin-dashboard.component';
import { SocketService } from './socket.service';
import { UserModule } from './user/user.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    // HomeComponent,
    // ErrorComponent,
    //LoginComponent,
    // SignupComponent,
    // ForgotPasswordComponent,
    // ResetPasswordComponent,
    UserDashboardComponent,
    UserSelectionComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    UserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule,
    HttpClientModule,
    NgbModalModule,
    SharedModule,
    NgbTooltipModule,
    Ng2SearchPipeModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forRoot([
      { path: '', loadChildren: () => import('./general/general.module').then(m => m.GeneralModule) },
      //{ path: 'login', component: LoginComponent },
      // { path: 'signup', component: SignupComponent },
      { path: 'not-found', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) },
      { path: 'server-error/:error', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) },
      // { path: 'forgot-password', component: ForgotPasswordComponent },
      // { path: 'reset-password/:authToken/:userId', component: ResetPasswordComponent },
      { path: 'user-dashboard', component: UserDashboardComponent },
      { path: 'user-selection', component: UserSelectionComponent },
      { path: 'admin-dashboard/:participantId', component: AdminDashboardComponent },
      // {
      //   path: 'user-dashboard', loadChildren: () => import('./meeting/meeting.module').then(m => m.MeetingModule)
      // },
      // {
      //   path: 'user-selection', loadChildren: () => import('./meeting/meeting.module').then(m => m.MeetingModule)
      // },
      {
        path: 'login', loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'signup', loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      },
      { path: '*', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) },
      { path: '**', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) }
    ]),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
