import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  // to toggle the error state and label position
  public passwordFocused: Boolean = false;
  public secondaryPasswordFocused: Boolean = false;
  public passwordFilled: Boolean = false;

  public authToken = this._route.snapshot.paramMap.get('authToken');
  public userId = this._route.snapshot.paramMap.get('userId');

  // Creation of form group
  passwordResetForm = new FormGroup({
    newPassword: new FormControl(null, [Validators.required, Validators.pattern("^(?=.*[#?!@$%^&*-])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$")])
  });

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.authCheck();
  }

  // checking if link is still valid
  public authCheck = () => {
    let data = {
      authToken: this.authToken,
      firstCheck: true
    }
    this.appService.checkAuth(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success("Active link, please enter new password", '', { timeOut: 3000 });
      }
      else {
        apiResult.message = "This link is either invalid or expired."
        this.toastr.error(apiResult.message);
        this.router.navigate(['not-found'])
      }
    }, (err) => {
      this.toastr.error("Some Error Occured");
      this.router.navigate(['server-error', 500]);
    });
  } // end of authCheck

  // function to navigate to login
  public goToLogin = (): any => {
    this.router.navigate(['/login'])
  } // end of gotToLogin

  // function to toggle password focus state
  togglePasswordFocus() {
    if (this.passwordResetForm.controls.newPassword.value === null || this.passwordResetForm.controls.newPassword.value === '') {
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

  // function to reset the password
  editUserPassword(f: any) {
    let data = {
      authToken: this.authToken,
      userId: this.userId,
      newPassword: f.controls.newPassword.value,
      firstCheck: false
    }
    this.appService.editUserPassword(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message)
        setTimeout(() => {
          this.goToLogin();
        }, 2000);
      }
      else if (apiResult.status === 404) {
        apiResult.message = "This link is either invalid or expired."
        this.toastr.error(apiResult.message);
        this.router.navigate(['not-found']);
      }
      else if (apiResult.status === 500) {
        apiResult.message = "This link is either invalid or expired."
        this.toastr.error(apiResult.message);
        this.router.navigate(['not-found'])
      }
      else {
        this.toastr.error(apiResult.message)
      }
    }, (err) => {
      this.toastr.error("Some Error Occured");
      this.router.navigate(['server-error', 500]);
    })
  } // end of editUserPassword
}
