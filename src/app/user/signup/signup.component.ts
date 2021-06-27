import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  // possible list of countries
  public countryList: any = ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire, Saint Eustatius and Saba ", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Reunion", "Romania", "Russia", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"]

  // form element error state and label position toggles on focus
  public status?: Boolean;
  public result?: boolean;
  public firstNameFocused: Boolean = false;
  public secondaryFirstNameFocused: Boolean = false;
  public firstNameFilled: Boolean = false;
  public lastNameFocused: Boolean = false;
  public secondaryLastNameFocused: Boolean = false;
  public lastNameFilled: Boolean = false;
  public userNameFocused: Boolean = false;
  public secondaryUserNameFocused: Boolean = false;
  public userNameFilled: Boolean = false;
  public mobileFocused: Boolean = false;
  public secondaryMobileFocused: Boolean = false;
  public mobileFilled: Boolean = false;
  public countryFocused: Boolean = false;
  public secondaryCountryFocused: Boolean = false;
  public countryFilled: Boolean = false;
  public emailFocused: Boolean = false;
  public secondaryMailFocused: Boolean = false;
  public emailFilled: Boolean = false;
  public passwordFocused: Boolean = false;
  public secondaryPasswordFocused: Boolean = false;
  public passwordFilled: Boolean = false;
  public confirmPasswordFocused: Boolean = false;
  public secondaryConfirmPasswordFocused: Boolean = false;
  public confirmPasswordFilled: Boolean = false;

  // password suggestion related variables
  public toggles = false;
  public minNumberOfCharacters!: Boolean;
  public maxNumberOfCharacters!: Boolean;
  public upperCaseCharacters!: Boolean;
  public lowerCaseCharacters!: Boolean;
  public specialCharacters!: Boolean;

  // to check password at each pattern
  public passwordPattern1 = /^(.{8,})$/;
  public passwordPattern2 = /^(.{8,30})$/;
  public passwordPattern3 = /[A-Z]/g;
  public passwordPattern4 = /[a-z]/g;
  public passwordPattern5 = /[#?!@$%^&*-]/g;

  // stores the value to update the progress bar
  public percentageValue: any = 0;
  public resultPercentage: String = "0%";

  // to track which inputs the progress bar is updated for. 
  // takes values 1 or 0.
  public updateObj = {
    firstName: 0,
    userName: 0,
    mobileNumber: 0,
    country: 0,
    email: 0,
    password: 0,
    confirmPassword: 0
  }

  // for role based access/views after login
  public adminStatus: Boolean = false;

  // creation of login form group
  signupForm = new FormGroup({
    userFirstName: new FormControl(null, [Validators.required, Validators.pattern("([a-zA-Z]{2,30}$)")]),
    userLastName: new FormControl(null, [Validators.pattern("([a-zA-Z_ ]{1,30}$)")]),
    userName: new FormControl(null, [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-__]{2,20}$)")]),
    userMobileNumber: new FormControl(null, [Validators.required, Validators.pattern("^[1-9][0-9]{5,15}$")]),
    userCountry: new FormControl(null, [Validators.required, this.allowedCountries.bind(this)]),
    userMail: new FormControl(null, [Validators.required, Validators.pattern("^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,6})+$")]),
    userPassword: new FormControl(null, [Validators.required, Validators.pattern("^(?=.*[#?!@$%^&*-])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$")]),
    userConfirmPassword: new FormControl(null, [Validators.required, Validators.pattern("^(?=.*[#?!@$%^&*-])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$")])
  });

  constructor(public router: Router,
    public appService: AppService,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void { }

  /* Compares passwords */
  public verify = () => {
    if (this.signupForm.controls.userPassword.value == this.signupForm.controls.userConfirmPassword.value) {
      this.result = true;
    }
    else {
      this.result = false;
    }
  } // end of verify

  // function that resets form and all toggled states
  public resetForm = () => {
    this.signupForm.reset();
    this.firstNameFocused = false;
    this.secondaryFirstNameFocused = false;
    this.firstNameFilled = false;
    this.lastNameFocused = false;
    this.secondaryLastNameFocused = false;
    this.lastNameFilled = false;
    this.userNameFocused = false;
    this.secondaryUserNameFocused = false;
    this.userNameFilled = false;
    this.mobileFocused = false;
    this.secondaryMobileFocused = false;
    this.mobileFilled = false;
    this.countryFocused = false;
    this.secondaryCountryFocused = false;
    this.countryFilled = false;
    this.emailFocused = false;
    this.secondaryMailFocused = false;
    this.emailFilled = false;
    this.passwordFocused = false;
    this.secondaryPasswordFocused = false;
    this.passwordFilled = false;
    this.confirmPasswordFocused = false;
    this.secondaryConfirmPasswordFocused = false;
    this.confirmPasswordFilled = false;
    this.toggles = false;
    this.minNumberOfCharacters = false;
    this.maxNumberOfCharacters = false;
    this.upperCaseCharacters = false;
    this.lowerCaseCharacters = false;
    this.specialCharacters = false;
    this.percentageValue = 0;
    this.resultPercentage = "0%";
    Object.keys(this.updateObj).forEach((key) => { this.updateObj[key] = 0 });
  } // end of resetForm

  // function to check password in stages
  validatePassword() {
    if ((this.signupForm.get('userPassword')!.value) !== null) {
      if ((this.signupForm.get('userPassword')!.value).match(this.passwordPattern1)) {
        this.minNumberOfCharacters = true;
      }
      else {
        this.minNumberOfCharacters = false;
      }
      if ((this.signupForm.get('userPassword')!.value).match(this.passwordPattern2)) {
        this.maxNumberOfCharacters = true;
      }
      else {
        this.maxNumberOfCharacters = false;
      }
      if ((this.signupForm.get('userPassword')!.value).match(this.passwordPattern3)) {
        this.upperCaseCharacters = true;
      }
      else {
        this.upperCaseCharacters = false;
      }
      if ((this.signupForm.get('userPassword')!.value).match(this.passwordPattern4)) {
        this.lowerCaseCharacters = true;
      }
      else {
        this.lowerCaseCharacters = false;
      }
      if ((this.signupForm.get('userPassword')!.value).match(this.passwordPattern5)) {
        this.specialCharacters = true;
      }
      else {
        this.specialCharacters = false;
      }
    }
  } // end of validatePassword

  // function to toggle popover
  toggle() {
    this.toggles = true;
  } // end of toggle

  // function to toggle popover
  badToggle() {
    this.toggles = false;
  } // end of badToggle

  // function to toggle first name focus state
  toggleFirstNameFocus() {
    if (this.signupForm.controls.userFirstName.value === null || this.signupForm.controls.userFirstName.value === '') {
      this.firstNameFilled = false;
    }
    else {
      this.firstNameFilled = true
    }
    if (this.secondaryFirstNameFocused === false) {
      this.secondaryFirstNameFocused = true;
    }
    else {
      this.secondaryFirstNameFocused = false;
    }
    if (this.firstNameFocused === false) {
      this.firstNameFocused = true;
    }
    else if (this.firstNameFocused === true && !this.firstNameFilled) {
      this.firstNameFocused = false;
    }
  } // end of toggleFirstNameFocus

  // function to toggle last name focus state
  toggleLastNameFocus() {
    if (this.signupForm.controls.userLastName.value === null || this.signupForm.controls.userLastName.value === '') {
      this.lastNameFilled = false;
    }
    else {
      this.lastNameFilled = true
    }
    if (this.secondaryLastNameFocused === false) {
      this.secondaryLastNameFocused = true;
    }
    else {
      this.secondaryLastNameFocused = false;
    }
    if (this.lastNameFocused === false) {
      this.lastNameFocused = true;
    }
    else if (this.lastNameFocused === true && !this.lastNameFilled) {
      this.lastNameFocused = false;
    }
  } // end of toggleLastNameFocus

  // function to toggle user name focus state
  toggleUserNameFocus() {
    if (this.signupForm.controls.userName.value === null || this.signupForm.controls.userName.value === '') {
      this.userNameFilled = false;
    }
    else {
      this.userNameFilled = true
    }
    if (this.secondaryUserNameFocused === false) {
      this.secondaryUserNameFocused = true;
    }
    else {
      this.secondaryUserNameFocused = false;
    }
    if (this.userNameFocused === false) {
      this.userNameFocused = true;
    }
    else if (this.userNameFocused === true && !this.userNameFilled) {
      this.userNameFocused = false;
    }
  } // end of toggleUserNameFocus

  // function to toggle mobile number focus state
  toggleMobileFocus() {
    if (this.signupForm.controls.userMobileNumber.value === null || this.signupForm.controls.userMobileNumber.value === '') {
      this.mobileFilled = false;
    }
    else {
      this.mobileFilled = true
    }
    if (this.secondaryMobileFocused === false) {
      this.secondaryMobileFocused = true;
    }
    else {
      this.secondaryMobileFocused = false;
    }
    if (this.mobileFocused === false) {
      this.mobileFocused = true;
    }
    else if (this.mobileFocused === true && !this.mobileFilled) {
      this.mobileFocused = false;
    }
  } // end of toggleMobileFocus

  // function to toggle country focus state
  toggleCountryFocus() {
    if (this.signupForm.controls.userCountry.value === null || this.signupForm.controls.userCountry.value === '') {
      this.countryFilled = false;
    }
    else {
      this.countryFilled = true
    }
    if (this.secondaryCountryFocused === false) {
      this.secondaryCountryFocused = true;
    }
    else {
      this.secondaryCountryFocused = false;
    }
    if (this.countryFocused === false) {
      this.countryFocused = true;
    }
    else if (this.countryFocused === true && !this.countryFilled) {
      this.countryFocused = false;
    }
  } // end of toggleCountryFocus

  // function to toggle email focus state
  toggleEmailFocus() {
    if (this.signupForm.controls.userMail.value === null || this.signupForm.controls.userMail.value === '') {
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

  // function to toggle password focus state
  togglePasswordFocus() {
    if (this.signupForm.controls.userPassword.value === null || this.signupForm.controls.userPassword.value === '') {
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

  // function to toggle confirm password focus state
  toggleConfirmPasswordFocus() {
    if (this.signupForm.controls.userConfirmPassword.value === null || this.signupForm.controls.userConfirmPassword.value === '') {
      this.confirmPasswordFilled = false;
    }
    else {
      this.confirmPasswordFilled = true;
    }
    if (this.secondaryConfirmPasswordFocused === false) {
      this.secondaryConfirmPasswordFocused = true;
    }
    else {
      this.secondaryConfirmPasswordFocused = false;
    }
    if (this.confirmPasswordFocused === false) {
      this.confirmPasswordFocused = true;
    }
    else if (this.confirmPasswordFocused === true && !this.confirmPasswordFilled) {
      this.confirmPasswordFocused = false;
    }
  } // end of toggleConfirmPasswordFocus

  // function to update progress bar
  public updateProgressBar = () => {
    if ((this.signupForm.controls.userFirstName.dirty && this.signupForm.controls.userFirstName.valid) && (this.updateObj.firstName !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['firstName'] = 1;
    }
    else if ((this.updateObj.firstName == 1) && this.signupForm.controls.userFirstName.invalid) {
      this.updateObj['firstName'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userName.dirty && this.signupForm.controls.userName.valid) && (this.updateObj.userName !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['userName'] = 1;
    }
    else if ((this.updateObj.userName == 1) && this.signupForm.controls.userName.invalid) {
      this.updateObj['userName'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userMobileNumber.dirty && this.signupForm.controls.userMobileNumber.valid) && (this.updateObj.mobileNumber !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['mobileNumber'] = 1;
    }
    else if ((this.updateObj.mobileNumber == 1) && this.signupForm.controls.userMobileNumber.invalid) {
      this.updateObj['mobileNumber'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userCountry.dirty && this.signupForm.controls.userCountry.valid) && (this.updateObj.country !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['country'] = 1;
    }
    else if ((this.updateObj.country == 1) && this.signupForm.controls.userCountry.invalid) {
      this.updateObj['country'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userMail.dirty && this.signupForm.controls.userMail.valid) && (this.updateObj.email !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['email'] = 1;
    }
    else if ((this.updateObj.email == 1) && this.signupForm.controls.userMail.invalid) {
      this.updateObj['email'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userPassword.dirty && this.signupForm.controls.userPassword.valid) && (this.updateObj.password !== 1)) {
      this.percentageValue += 14.2857143;
      this.updateObj['password'] = 1;
    }
    else if ((this.updateObj.password == 1) && this.signupForm.controls.userPassword.invalid) {
      this.updateObj['password'] = 0;
      this.percentageValue -= 14.2857143;
    }
    if ((this.signupForm.controls.userConfirmPassword.dirty && this.signupForm.controls.userConfirmPassword.valid) && (this.updateObj.confirmPassword !== 1) && this.result) {
      this.percentageValue += 14.2857143;
      this.updateObj['confirmPassword'] = 1;
    }
    else if (((this.updateObj.confirmPassword == 1) && (this.signupForm.controls.userConfirmPassword.invalid)) || ((this.updateObj.confirmPassword == 1) && (this.signupForm.controls.userPassword.dirty || this.signupForm.controls.userConfirmPassword.dirty) && !this.result)) {
      this.updateObj['confirmPassword'] = 0;
      this.percentageValue -= 14.2857143;
    }
    this.resultPercentage = this.percentageValue + "%"
  } // end of updateProgressBar

  // custom form validator to check if country is present
  public allowedCountries(control: FormControl): { [s: string]: boolean } {
    if (this.countryList.indexOf(control.value) === -1) {
      return { 'countryNotAllowed': true }
    }
    return null!;
  } // end of allowedCountries

  // function to signup
  signUpFunction(f: any) {
    let tempString = (f.controls.userName.value).substr((f.controls.userName.value).length - 5, (f.controls.userName.value).length - 1);
    if (tempString === 'admin') {
      this.adminStatus = true;
    }
    let data = {
      firstName: f.controls.userFirstName.value,
      lastName: f.controls.userLastName.value,
      userName: f.controls.userName.value,
      adminStatus: this.adminStatus,
      mobileNumber: f.controls.userMobileNumber.value,
      country: f.controls.userCountry.value,
      email: f.controls.userMail.value.toLowerCase(),
      password: f.controls.userPassword.value
    }
    if (data.lastName === null || data.lastName === undefined) {
      data.lastName = '';
    }
    this.appService.signupFunction(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 4000 });
        setTimeout(() => {
          this.navigateToLogin();
        }, 2000);
      }
      else if (apiResult.status === 500) {
        this.router.navigate(['server-error', 500])
      }
      else {
        this.toastr.error(apiResult.message)
      }
    }, (err) => {
      this.toastr.error("Some Error Occured");
      this.router.navigate(['server-error', 500]);
    })
  } // end of signUpFunction

  // function to navigate to login route
  public navigateToLogin: any = () => {
    this.router.navigate(['/login']);
  } // end of navigateToLogin

}
