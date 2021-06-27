import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { MeetingService } from 'src/app/meeting.service';

@Component({
  selector: 'app-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.css']
})
export class UserSelectionComponent implements OnInit {

  // other variables
  public allUsers: String[] = [];
  public term: any;
  public loading: Boolean = false;
  public none: Boolean = false;

  // variables holding session details
  authToken: any;
  errorFlag: number = 0;
  userInfo: any;

  constructor(
    public toastr: ToastrService,
    public router: Router,
    public appService: AppService,
    public meetingService: MeetingService
  ) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    if (this.checkStatus() && this.userInfo.adminStatus === true) {
      this.loading = true;
      setTimeout(() => {
        this.getAllUsers();
      }, 1250);
    }
    else if (this.userInfo.adminStatus === false) {
      this.router.navigate(['/not-found']);
    }
  }

  // function to delete all cookies possibly present
  deleteCookies() {
    Cookie.delete('authtoken');
    Cookie.delete('userId');
  } // end of deleteCookies

  // fucntion to check the authToken/session of the user
  checkStatus: any = () => {
    if (this.authToken === undefined || this.authToken === '' || this.authToken === null) {
      if (this.errorFlag === 0) {
        this.toastr.error('Invalid/missing auth token. Login again');
        this.errorFlag = 1;
        this.router.navigate(['/not-found']);
        return false;
      }
    } else {
      return true;
    }
  } //end of checkStatus  

  // function to show all users in the view
  getAllUsers = () => {
    let data = {
      authToken: this.authToken
    }
    this.meetingService.getAllUsers(data).subscribe((apiResult) => {
      this.loading = false;
      if (apiResult.status === 200) {
        for (let user of apiResult.data) {
          if (user.adminStatus !== true) {
            this.allUsers.push(user);
          }
        }
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.none = true;
      }
      else if (apiResult.status === 500) {
        this.deleteCookies();
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.router.navigate(['server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    });
  } // end of getAllUsers

  // show the calendar/events of the selected user
  navigateToUserCalendar = (userId) => {
    setTimeout(() => {
      this.router.navigate(['admin-dashboard', userId]);
    }, 1000);
  } // end of navigateToUserCalendar

  // function to logout
  logout() {
    let data = {
      userId: this.userInfo.userId,
      authToken: this.authToken
    }
    this.appService.userLogout(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/home']);
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/not-found']);
      }
      else if (apiResult.status === 403) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/home']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    });
  } // end of logout
}
