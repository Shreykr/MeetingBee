import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';

const userRoutes: Routes = [

    {
        path: 'login',
        component: LoginComponent,
        data: { animation: 'isLeft' }
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
    }, {
        path: 'reset-password/:authToken/:userId',
        component: ResetPasswordComponent
    }, {
        path: 'signup',
        component: SignupComponent,
        data: { animation: 'isLeft' }
    }
];

@NgModule({
    imports: [RouterModule.forChild(userRoutes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }