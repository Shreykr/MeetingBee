import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'src/app/meeting.service';

// calendar related imports
import { isSameDay, isSameMonth, getMonth, getDate, getISOWeek, getDayOfYear, isToday } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isThisMinute } from 'date-fns/esm';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  // other varaibles
  public allMeetings: any = [];
  public snoozeTime: number = 5000;
  public intervalInstance: any;
  public dropdownValue: String = "Month";
  public meetingInstances: any = [];
  public key: any;
  public rightArrowValue: any;
  public leftArrowValue: any;

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

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.key = event.keyCode;
    if (this.key === 77) {
      this.setView(CalendarView.Month);
      this.changeButtonString(1);
    }
    if (this.key === 87) {
      this.setView(CalendarView.Week);
      this.changeButtonString(2);
    }
    if (this.key === 68) {
      this.setView(CalendarView.Day);
      this.changeButtonString(3);
    }
  }

  // variables holding modal content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  @ViewChild('meetingAlert', { static: true }) meetingAlert: TemplateRef<any>;

  // all angular-calendar related variables
  activeDayIsOpen: boolean = true;
  CalendarView = CalendarView;
  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date(); // setting current date tab in calendar
  public events: CalendarEvent[] = []; // declaring array of events
  refresh: Subject<any> = new Subject();

  // variables holding session details
  authToken: any;
  errorFlag: number = 0;
  userInfo: any;

  // other variables
  public leftArrowState: Boolean = false;
  public rightArrowState: Boolean = false;

  constructor(
    private modal: NgbModal,
    public toastr: ToastrService,
    public _route: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    public meetingService: MeetingService
  ) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    if (this.checkStatus() && this.userInfo.adminStatus === false) {

      //getting all meeting details to populate calendar
      this.getMeetingDetails();

      //check for a meeting for every 5 seconds
      this.scanMeetings();

    }
    else if (this.userInfo.adminStatus === true) {
      this.deleteCookies();
      this.toastr.error("Invalid Access", '', { timeOut: 2000 });
      this.router.navigate(['/home']);
    }
  }

  // function to scan for new meeting every 5 seconds
  scanMeetings() {
    this.intervalInstance = setInterval(() => {
      this.meetingReminder();
    }, this.snoozeTime);
  } // end of scanMeetings

  // function to start a new scan after Snooze
  clearScan() {
    clearInterval(this.intervalInstance);
  } // end of clearScan

  // function to delete all cookies possibly present
  deleteCookies() {
    Cookie.delete('authtoken');
    Cookie.delete('userId');
  } // end of deleteCookies

  // fucntion to check the authToken/session of the user
  checkStatus() {
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

  // actions to perform when day-cell is clicked
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  } // end of dayClicked

  // function to open modal when clicked
  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  } // end of handleEvent

  // function to set current calendar view
  setView(view: CalendarView) {
    this.view = view;
  } // end of setView

  // function to set current calendar view to Day
  changeDay(date: Date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  } // end of changeDay

  // Updating view
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  } // end of closeOpenMonthViewDay

  // function to check year so as to limit it
  checkYear() {
    if (this.view === CalendarView.Month) {
      this.rightArrowState = false;
      this.leftArrowState = false;
      if (getMonth(this.viewDate) === 0 && this.leftArrowState === false) {
        this.leftArrowState = true;
      }
      else if (getMonth(this.viewDate) > 0) {
        this.leftArrowState = false;
      }
      if (getMonth(this.viewDate) === 11 && this.rightArrowState === false) {
        this.rightArrowState = true;
      }
      else if (getMonth(this.viewDate) < 11) {
        this.rightArrowState = false;
      }
    }
    else if (this.view === CalendarView.Week) {
      this.rightArrowState = false;
      this.leftArrowState = false;
      if ((getISOWeek(this.viewDate) === 1) || (getDate(this.viewDate) <= 6 && getISOWeek(this.viewDate) === 53) && this.leftArrowState === false) {
        this.leftArrowState = true;
      }
      else if ((getISOWeek(this.viewDate) > 1)) {
        this.leftArrowState = false;
      }
      if ((getISOWeek(this.viewDate) === 52) || (getDate(this.viewDate) >= 25 && getISOWeek(this.viewDate) === 53) && this.rightArrowState === false) {
        this.rightArrowState = true;
      }
      else if ((getISOWeek(this.viewDate) < 52)) {
        this.rightArrowState = false;
      }
    }
    else if (this.view === CalendarView.Day) {
      this.rightArrowState = false;
      this.leftArrowState = false;
      if ((getDayOfYear(this.viewDate) === 1) && this.leftArrowState === false) {
        this.leftArrowState = true;
      }
      else if ((getDayOfYear(this.viewDate) > 1)) {
        this.leftArrowState = false;
      }
      if ((getMonth(this.viewDate) === 11) && (getDate(this.viewDate) === 31) && this.rightArrowState === false) {
        this.rightArrowState = true;
      }
      else if ((getMonth(this.viewDate) === 11) && (getDate(this.viewDate) < 31)) {
        this.rightArrowState = false;
      }
    }
  } // end of checkYear

  getMeetingDetails() {
    let data = {
      authToken: this.authToken,
      participantId: this.userInfo.userId,
      userId: this.userInfo.userId
    }
    this.meetingService.getMeetingDetails(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.allMeetings = apiResult.data;
        this.meetingInstances.splice(0, this.meetingInstances.length)
        for (let meeting of this.allMeetings) {
          this.meetingInstances.push({ start: meeting.meetingStart, end: meeting.meetingEnd });
          this.meetingInstancesSort();
          meeting['start'] = new Date(meeting.meetingStart);
          meeting['end'] = new Date(meeting.meetingEnd);
          meeting['title'] = meeting.meetingTitle;
          meeting['reminderStatus'] = true;
          meeting['modalOpen'] = false;
        }
        for (let meeting of this.allMeetings) {
          if (this.colorPicker(meeting)) {
            meeting['color'] = colors.yellow;
          }
          else {
            meeting['color'] = colors.blue;
          }
        }
        this.events = this.allMeetings;
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 2050 });
        this.router.navigate(['/not-found']);
      }
      else if (apiResult.status === 403) {
        this.events = [];
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/server-error', 500]);
      }
    })
  } // end of getMeetingDetails

  // sorting for every API call to get meetings
  // sort is done on start time
  meetingInstancesSort() {
    this.meetingInstances.sort(function (a, b) {
      let eleA = a.start
      let eleB = b.start
      if (eleA < eleB) {
        return -1;
      }
      if (eleA > eleB) {
        return 1;
      }
    });
  } // end of meetingInstancesSort

  // logic to choose color for overlapping meetings
  colorPicker(meeting: any): Boolean {
    if (this.meetingInstances.length > 1) {
      for (let j = 0; j < this.meetingInstances.length; j++) {
        if ((meeting.meetingStart > this.meetingInstances[j].start && meeting.meetingStart < this.meetingInstances[j].end)) {
          return true;
        }
        else {
          continue;
        }
      }
      return false;
    }
    else {
      return false;
    }
  } // end of colorPicker

  // alert 1 minute before meeting starts
  meetingReminder() {
    for (let meeting of this.allMeetings) {
      // this.modal.open(this.meetingAlert, { size: 'lg' });
      // break;
      if (isToday(meeting['start']) && (isThisMinute(new Date(((meeting['start']).getTime()) - 60000)) && meeting['reminderStatus'])) {
        this.modalData = {
          action: 'Clicked',
          event: meeting
        };
        if (meeting['modalOpen'] === false) {
          meeting['modalOpen'] = true;
          this.modal.open(this.meetingAlert, { size: 'lg' }).result.then((result) => {
            meeting['modalOpen'] = false;
          }, (reason) => {
            meeting['modalOpen'] = false;
          });
        }
        break;
      }
    }
  } // end of meetingReminder

  // changing dropdown/arrow tooltip value based on calendar view
  changeButtonString(value: number) {
    if (value === 1) {
      this.dropdownValue = "Month"
      this.rightArrowValue = "Next Month";
      this.leftArrowValue = "Previous Month";

    }
    else if (value === 2) {
      this.dropdownValue = "Week";
      this.rightArrowValue = "Next Week";
      this.leftArrowValue = "Previous Week";
    }
    else if (value === 3) {
      this.dropdownValue = "Day";
      this.rightArrowValue = "Next Day";
      this.leftArrowValue = "Previous Day";
    }
  } // end of changeButtonString

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
