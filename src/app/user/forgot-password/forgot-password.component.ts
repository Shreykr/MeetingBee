import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from './../../app.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  // variables to store screen sizes
  public status?: Boolean;
  public scrHeight = window.innerHeight;
  public scrWidth = window.innerWidth;
  public detectScroll!: Boolean;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.detectScroll = true;
    if (scrollY === 0) {
      this.detectScroll = false;
    }
  }

  // to toggle the error state
  public emailFocused: Boolean = false;
  public secondaryMailFocused: Boolean = false;
  public emailFilled: Boolean = false;

  // creation of login form
  forgotPasswordForm = new FormGroup({
    userMail: new FormControl(null, [Validators.required, Validators.email])
  })
  constructor(
    public appService: AppService,
    public router: Router,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  // function to navigate to reset password route
  public goToResetPassword: any = () => {
    setTimeout(() => {
      this.router.navigate(['/reset-password']);
    }, 1000);
  } // end of goToResetPassword

  // function to toggle email focus state
  toggleEmailFocus() {
    if (this.forgotPasswordForm.controls.userMail.value === null || this.forgotPasswordForm.controls.userMail.value === '') {
      this.emailFilled = false;
    }
    else {
      this.emailFilled = true
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

  //function to send the recovery mail
  sendRecoveryMail(val: any) {
    let data = {
      email: this.forgotPasswordForm.controls.userMail.value.toLowerCase()
    }
    this.appService.sendMail(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        setTimeout(() => {
          this.toastr.success(apiResult.message);
        }, 1000);
      }
      else {
        this.toastr.error(apiResult.message);
      }
    }, (err) => {

      this.toastr.error("Some Error Occured");
    })
  } // end of sendRecoveryMail

}
