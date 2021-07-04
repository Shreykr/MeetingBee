import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //other variable(s)
  public blockRequest: Boolean = false;
  public loading: Boolean = false;

  // to toggle the error state
  public emailFocused: Boolean = false;
  public passwordFocused: Boolean = false;
  public secondaryMailFocused: Boolean = false;
  public secondaryPasswordFocused: Boolean = false;
  public emailFilled: Boolean = false;
  public passwordFilled: Boolean = false;

  // creation of login form
  loginForm = new FormGroup({
    userMail: new FormControl(null, [Validators.required, Validators.email]),
    userPassword: new FormControl(null, [Validators.required, Validators.pattern("^(?=.*[#?!@$%^&*-])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$")])
  })
  constructor(
    public appService: AppService,
    public router: Router,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  // function to navigate to forgot password route
  public goToForgotPassword: any = () => {
    setTimeout(() => {
      this.router.navigate(['/forgot-password']);
    }, 1000);
  } // end of goToForgotPassword

  // function to toggle email focus state
  toggleEmailFocus() {
    if (this.loginForm.controls.userMail.value === null || this.loginForm.controls.userMail.value === '') {
      this.emailFilled = false;
    }
    else {
      this.emailFilled = true;
    }
    if (this.secondaryMailFocused === false) {
      this.secondaryMailFocused = true;
    }
    else {
      this.secondaryMailFocused = false;
    }
    if (this.emailFocused === false) {
      this.emailFocused = true;
    }
    else if (this.emailFocused === true && !this.emailFilled) {
      this.emailFocused = false;
    }
  } // end of toggleEmailFocus

  // function to toggle password focus state
  togglePasswordFocus() {
    if (this.loginForm.controls.userPassword.value === null || this.loginForm.controls.userPassword.value === '') {
      this.passwordFilled = false;
    }
    else {
      this.passwordFilled = true;
    }
    if (this.secondaryPasswordFocused === false) {
      this.secondaryPasswordFocused = true;
    }
    else {
      this.secondaryPasswordFocused = false;
    }
    if (this.passwordFocused === false) {
      this.passwordFocused = true;
    }
    else if (this.passwordFocused === true && !this.passwordFilled) {
      this.passwordFocused = false;
    }
  } // end of togglePasswordFocus

  /* Sending the data so as to login user */
  loginFunction(f: any) {
    let data = {
      email: f.controls.userMail.value.toLowerCase(),
      password: f.controls.userPassword.value
    }
    if (!this.blockRequest) {
      this.blockRequest = true;
      this.loading = true;
      this.appService.loginFunction(data).subscribe((apiResult) => {
        if (apiResult.status === 200) {
          this.loading = false;
          Cookie.set('authtoken', apiResult.data.authToken);
          Cookie.set('userId', apiResult.data.userDetails.userId);
          this.appService.setUserInfoInLocalStorage(apiResult.data.userDetails);
          if (apiResult.data.userDetails.adminStatus === false) {
            setTimeout(() => {
              this.navigateToUserDashboard()
            }, 750);
          }
          else if (apiResult.data.userDetails.adminStatus === true) {
            setTimeout(() => {
              this.navigateToUserSelection()
            }, 750);
          }
        }
        else if (apiResult.status === 404) {
          this.loading = false;
          this.toastr.error(apiResult.message);
          this.router.navigate(['not-found']);
        }
        else if (apiResult.status === 500) {
          this.loading = false;
          this.router.navigate(['server-error', 500]);
        }
        else {
          this.loading = false;
          setTimeout(() => {
            this.blockRequest = false;
          }, 2050);
          this.toastr.error(apiResult.message, '', { timeOut: 2000 })
        }
      }, (err) => {
        this.loading = false;
        this.toastr.error("Some Error Occured");
        this.router.navigate(['server-error', 500]);
      })
    }
  }// end of loginFunction

  // show normal user view
  navigateToUserDashboard = () => {
    this.router.navigate(['user-dashboard']);
  } // end of navigateToUserDashboard

  // show admin user's view
  navigateToUserSelection = () => {
    this.router.navigate(['user-selection']);
  } // end of navigateToUserSelection
}
