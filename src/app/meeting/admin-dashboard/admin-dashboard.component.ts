import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isSameDay, isSameMonth, getMonth, getDate, getISOWeek, getDayOfYear } from 'date-fns';
import { AppService } from 'src/app/app.service';
import { MeetingService } from 'src/app/meeting.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';

//calendar related imports
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarView } from 'angular-calendar';

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
  green: {
    primary: '#21ad31',
    secondary: '#e3fae8',
  }
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {

  // other varaibles
  public allMeetings: any = [];
  public typeName: any = ''; // stores the input type 'datetime-local' and toggles it when input is focused
  public typeName2: any = '';
  public typeName3: any = '';
  public typeName4: any = '';
  public startResult: Boolean = false;
  public endResult: Boolean = false;
  public modalFlag1: Boolean = false;
  public modalFlag2: Boolean = false;
  public dropdownValue: String = "Month";
  public meetingInstances: any = [];
  public key: any;
  public rightArrowValue: any;
  public leftArrowValue: any;
  public loading: Boolean = false;
  public leftArrowState: Boolean = false;
  public rightArrowState: Boolean = false;
  public subscription: Subscription;

  // to toggle the error state
  public titleFocused: Boolean = false;
  public secondaryTitleFocused: Boolean = false;
  public titleFilled: Boolean = false;
  public descriptionFocused: Boolean = false;
  public secondaryDescriptionFocused: Boolean = false;
  public descriptionFilled: Boolean = false;
  public locationFocused: Boolean = false;
  public secondaryLocationFocused: Boolean = false;
  public locationFilled: Boolean = false;
  public startTimeFocused: Boolean = false;
  public startTimeFilled: Boolean = false;
  public endTimeFocused: Boolean = false;
  public endTimeFilled: Boolean = false;

  // variables holding modal content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  // variables holding modal content
  @ViewChild('modalContent2', { static: true }) modalContent2: TemplateRef<any>;
  createData: {
    action: string;
  };

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
  participantMail: any;
  participantUserName: any;

  // reactive form
  createMeetingForm = new FormGroup({
    meetingTitle: new FormControl(null, [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!'_ ]{2,50}$)")]),
    meetingDescription: new FormControl(null, [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!()^&?:',;__ ]{2,120}$)")]),
    meetingLocation: new FormControl(null, [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!()^&?:',;__ ]{2,500}$)")]),
    meetingStart: new FormControl(null, [Validators.required]),
    meetingEnd: new FormControl(null, [Validators.required])
  });

  // declaring form group instance
  updateMeetingForm: FormGroup;

  constructor(
    private modal: NgbModal,
    public toastr: ToastrService,
    public _route: ActivatedRoute,
    public router: Router,
    public appService: AppService,
    public socketService: SocketService,
    public meetingService: MeetingService
  ) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    Cookie.delete('mail');
    if (this.checkStatus() && this.userInfo.adminStatus === true) {
      this.loading = true;
      setTimeout(() => {
        this.getMeetingDetails();
      }, 2000);

      // initiating socket connection
      this.connectToSocket();

      //testing socket connection
      this.verifyUserConfirmation();

      // getting particular user details
      this.getUserDetail();

      // receiving real time notifications to subscribed socket events
      this.receiveRealTimeNotifications();

      // update arrow tooltip to month
      this.changeButtonString(1);
    }
    else if (this.userInfo.adminStatus === false) {
      this.router.navigate(['/not-found']);
    }

    this.checkYear();
  }

  ngOnDestroy() {
    if (this.checkStatus()) {
      this.subscription.unsubscribe();
    }
  }

  // starting socket connection on component load
  public connectToSocket: any = () => {
    this.socketService.startConnection()
      .subscribe(() => {
      });
  } // end of connectToSocket

  //function to verify user (socket connection testing)
  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser()
      .subscribe((data) => {
        this.socketService.setUser(this.authToken);
      });
  }// end of verifyUserConfirmation

  // function to receive real time notifications
  receiveRealTimeNotifications() {
    this.subscription = this.socketService.receiveRealTimeNotifications(this.userInfo.userId).subscribe((data: any) => {
      this.loading = true;
      setTimeout(() => {
        this.toastr.info(`${data.notificationMessage}`, '', { timeOut: 5000 });
        this.getMeetingDetails();
      }, 1000);
    });
  } // end of receiveRealTimeNotifications

  // function to delete all cookies possibly present
  deleteCookies = () => {
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
    this.titleFilled = true;
    this.titleFocused = true;
    this.descriptionFilled = true;
    this.descriptionFocused = true;
    this.locationFilled = true;
    this.locationFocused = true;
    this.startTimeFilled = true;
    this.startTimeFocused = true;
    this.endTimeFilled = true;
    this.endTimeFocused = true;
    let startDate = new Date(parseInt(this.modalData?.event['meetingStart']));
    let startDateString = startDate.toLocaleDateString();
    let startTimeString = startDate.toLocaleTimeString();
    let startResult = startDateString + " " + startTimeString;
    let endDate = new Date(parseInt(this.modalData?.event['meetingEnd']));
    let endDateString = endDate.toLocaleDateString();
    let endTimeString = endDate.toLocaleTimeString();
    let endResult = endDateString + " " + endTimeString;
    this.updateMeetingForm = new FormGroup({
      meetingUpdateTitle: new FormControl(this.modalData?.event['title'], [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!'_ ]{2,50}$)")]),
      meetingUpdateDescription: new FormControl(this.modalData?.event['meetingDescription'], [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!()^&?:',;__ ]{2,120}$)")]),
      meetingUpdateLocation: new FormControl(this.modalData?.event['meetingLocation'], [Validators.required, Validators.pattern("([a-zA-Z0-9.\\-@#*%!()^&?:',;__ ]{2,500}$)")]),
      meetingUpdateStart: new FormControl(startResult, [Validators.required]),
      meetingUpdateEnd: new FormControl(endResult, [Validators.required])
    });
    this.modal.open(this.modalContent, { size: 'lg' }).result.then((result) => {
      this.resetToggleStates();
    }, (reason) => {
      this.resetToggleStates();
    })
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
  checkYear = () => {
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

  // reset all states
  resetToggleStates = () => {
    this.titleFocused = false;
    this.secondaryTitleFocused = false;
    this.titleFilled = false;
    this.descriptionFocused = false;
    this.secondaryDescriptionFocused = false;
    this.descriptionFilled = false;
    this.locationFocused = false;
    this.secondaryLocationFocused = false;
    this.locationFilled = false;
    this.startTimeFocused = false;
    this.startTimeFilled = false;
    this.endTimeFocused = false;
    this.endTimeFilled = false;
    this.typeName = '';
    this.typeName2 = '';
    this.typeName3 = '';
    this.typeName4 = '';
    this.startResult = false;
    this.endResult = false;
  } // end of resetToggleStates

  // function to toggle title focus state
  toggleTitleFocus = () => {
    if ((this.createMeetingForm.controls.meetingTitle.value === null || this.createMeetingForm.controls.meetingTitle.value === '')) {
      this.titleFilled = false;
    }
    else {
      this.titleFilled = true
    }
    if (this.secondaryTitleFocused === false) {
      this.secondaryTitleFocused = true;
    }
    else {
      this.secondaryTitleFocused = false;
    }
    if (this.titleFocused === false) {
      this.titleFocused = true;
    }
    else if (this.titleFocused === true && !this.titleFilled) {
      this.titleFocused = false;
    }
  } // end of toggleTitleFocus

  // function to toggle description focus state
  toggleDescriptionFocus = () => {
    if ((this.createMeetingForm.controls.meetingDescription.value === null || this.createMeetingForm.controls.meetingDescription.value === '')) {
      this.descriptionFilled = false;
    }
    else {
      this.descriptionFilled = true
    }
    if (this.secondaryDescriptionFocused === false) {
      this.secondaryDescriptionFocused = true;
    }
    else {
      this.secondaryDescriptionFocused = false;
    }
    if (this.descriptionFocused === false) {
      this.descriptionFocused = true;
    }
    else if (this.descriptionFocused === true && !this.descriptionFilled) {
      this.descriptionFocused = false;
    }
  } // end of toggleDescriptionFocus

  // function to toggle location focus state
  toggleLocationFocus = () => {
    if ((this.createMeetingForm.controls.meetingLocation.value === null || this.createMeetingForm.controls.meetingLocation.value === '')) {
      this.locationFilled = false;
    }
    else {
      this.locationFilled = true
    }
    if (this.secondaryLocationFocused === false) {
      this.secondaryLocationFocused = true;
    }
    else {
      this.secondaryLocationFocused = false;
    }
    if (this.locationFocused === false) {
      this.locationFocused = true;
    }
    else if (this.locationFocused === true && !this.locationFilled) {
      this.locationFocused = false;
    }
  } // end of toggleLocationFocus

  // function to toggle start time focus state
  toggleStartTimeFocus = () => {
    if ((this.createMeetingForm.controls.meetingStart.value === null || this.createMeetingForm.controls.meetingStart.value === '')) {
      this.startTimeFilled = false;
      this.typeName = ''
    }
    else {
      this.startTimeFilled = true;
      this.typeName = 'datetime-local'
    }
    if (this.startTimeFocused === false) {
      this.startTimeFocused = true;
      this.typeName = 'datetime-local'
    }
    else if (this.startTimeFocused === true && !this.startTimeFilled) {
      this.startTimeFocused = false;
      this.typeName = ''
    }
  } // end of toggleStartTimeFocus

  // function to toggle end time focus state
  toggleEndTimeFocus = () => {
    if ((this.createMeetingForm.controls.meetingEnd.value === null || this.createMeetingForm.controls.meetingEnd.value === '')) {
      this.endTimeFilled = false;
      this.typeName2 = '';
    }
    else {
      this.endTimeFilled = true
      this.typeName2 = 'datetime-local';
    }
    if (this.endTimeFocused === false) {
      this.endTimeFocused = true;
      this.typeName2 = 'datetime-local';
    }
    else if (this.endTimeFocused === true && !this.endTimeFilled) {
      this.endTimeFocused = false;
      this.typeName2 = ''
    }
  } // end of toggleEndTimeFocus

  // function to toggle title focus state
  toggleTitleFocus2 = () => {
    if ((this.updateMeetingForm.controls.meetingUpdateTitle.value === null || this.updateMeetingForm.controls.meetingUpdateTitle.value === '') === true && this.titleFilled === true) {
      this.titleFilled = false;
    }
    else {
      this.titleFilled = true
    }
    if (this.secondaryTitleFocused === false) {
      this.secondaryTitleFocused = true;
    }
    else {
      this.secondaryTitleFocused = false;
    }
    if (this.titleFocused === false) {
      this.titleFocused = true;
    }
    else if (this.titleFocused === true && !this.titleFilled) {
      this.titleFocused = false;
    }
  } // end of toggleTitleFocus

  // function to toggle description focus state
  toggleDescriptionFocus2 = () => {
    if ((this.updateMeetingForm.controls.meetingUpdateDescription.value === null || this.updateMeetingForm.controls.meetingUpdateDescription.value === '') && this.descriptionFilled === true) {
      this.descriptionFilled = false;
    }
    else {
      this.descriptionFilled = true
    }
    if (this.secondaryDescriptionFocused === false) {
      this.secondaryDescriptionFocused = true;
    }
    else {
      this.secondaryDescriptionFocused = false;
    }
    if (this.descriptionFocused === false) {
      this.descriptionFocused = true;
    }
    else if (this.descriptionFocused === true && !this.descriptionFilled) {
      this.descriptionFocused = false;
    }
  } // end of toggleDescriptionFocus

  // function to toggle location focus state
  toggleLocationFocus2 = () => {
    if ((this.updateMeetingForm.controls.meetingUpdateLocation.value === null || this.updateMeetingForm.controls.meetingUpdateLocation.value === '') === true && this.locationFilled === true) {
      this.locationFilled = false;
    }
    else {
      this.locationFilled = true
    }
    if (this.secondaryLocationFocused === false) {
      this.secondaryLocationFocused = true;
    }
    else {
      this.secondaryLocationFocused = false;
    }
    if (this.locationFocused === false) {
      this.locationFocused = true;
    }
    else if (this.locationFocused === true && !this.locationFilled) {
      this.locationFocused = false;
    }
  } // end of toggleLocationFocus

  // function to toggle start time focus state
  toggleStartTimeFocus2 = () => {
    if ((this.updateMeetingForm.controls.meetingUpdateStart.value === null || this.updateMeetingForm.controls.meetingUpdateStart.value === '') && this.startTimeFilled === true) {
      this.startTimeFilled = false;
      this.typeName3 = '';
    }
    else {
      this.startTimeFilled = true
      this.typeName3 = 'datetime-local'
    }
    if (this.startTimeFocused === false) {
      this.startTimeFocused = true;
      this.typeName3 = 'datetime-local'
    }
    else if (this.startTimeFocused === true && !this.startTimeFilled) {
      this.startTimeFocused = false;
      this.typeName3 = ''
    }
  } // end of toggleStartTimeFocus

  // function to toggle end time focus state
  toggleEndTimeFocus2 = () => {
    if ((this.updateMeetingForm.controls.meetingUpdateEnd.value === null || this.updateMeetingForm.controls.meetingUpdateEnd.value === '') && this.endTimeFilled === true) {
      this.endTimeFilled = false;
      this.typeName4 = '';
    }
    else {
      this.endTimeFilled = true;
      this.typeName4 = 'datetime-local';
    }
    if (this.endTimeFocused === false) {
      this.endTimeFocused = true;
      this.typeName4 = 'datetime-local';
    }
    else if (this.endTimeFocused === true && !this.endTimeFilled) {
      this.endTimeFocused = false;
      this.typeName4 = '';
    }
  } // end of toggleEndTimeFocus

  // function to verify start date/time
  checkStartDate = () => {
    let currentTime = new Date();
    let selectedStartTime = new Date(this.createMeetingForm.controls.meetingStart.value);
    if (selectedStartTime < currentTime) {
      this.startResult = true;
    }
    else {
      this.startResult = false;
    }
    this.checkEndDate();
  } // end of checkStartDate

  // function to verify end date/time
  checkEndDate = () => {
    let currentTime = new Date();
    let selectedStartTime = new Date(this.createMeetingForm.controls.meetingStart.value);
    let selectedEndTime = new Date(this.createMeetingForm.controls.meetingEnd.value);
    if (selectedEndTime < currentTime) {
      this.endResult = true;
    }
    else if (selectedEndTime <= selectedStartTime) {
      this.endResult = true;
    }
    else {
      this.endResult = false;
    }
  } // end of checkEndDate

  // function to verify start date/time
  checkStartDate2 = () => {
    let currentTime = new Date();
    let selectedStartTime = new Date(this.updateMeetingForm.controls.meetingUpdateStart.value);
    if (selectedStartTime < currentTime) {
      this.startResult = true;
    }
    else {
      this.startResult = false;
    }
    this.checkEndDate2();
  } // end of checkStartDate2

  // function to verify end date/time
  checkEndDate2 = () => {
    let currentTime = new Date();
    let selectedStartTime = new Date(this.updateMeetingForm.controls.meetingUpdateStart.value);
    let selectedEndTime = new Date(this.updateMeetingForm.controls.meetingUpdateEnd.value);
    if (selectedEndTime < currentTime) {
      this.endResult = true;
    }
    else if (selectedEndTime <= selectedStartTime) {
      this.endResult = true;
    }
    else {
      this.endResult = false;
    }
  } // end of checkEndDate2

  // to open a modal after clicking create button
  createButtonClicked = (action: string): void => {
    this.createMeetingForm.reset();
    this.createData = { action };
    setTimeout(() => {
      this.modal.open(this.modalContent2, { size: 'lg' }).result.then((result) => {
        this.resetToggleStates();
      }, (reason) => {
        this.resetToggleStates();
      });
    }, 350);
  } // end of createButtonClicked

  // function to get all meeting details
  getMeetingDetails = () => {
    let data = {
      authToken: this.authToken,
      participantId: this._route.snapshot.paramMap.get('participantId'),
      userId: this.userInfo.userId
    }
    this.meetingService.getMeetingDetails(data).subscribe((apiResult) => {
      this.loading = false;
      if (apiResult.status === 200) {
        this.allMeetings = apiResult.data;
        this.meetingInstances.splice(0, this.meetingInstances.length)
        for (let meeting of this.allMeetings) {
          this.meetingInstances.push({ start: meeting.meetingStart, end: meeting.meetingEnd });
          this.meetingInstancesSort();
          meeting['start'] = new Date(meeting.meetingStart);
          meeting['end'] = new Date(meeting.meetingEnd);
          meeting['title'] = meeting.meetingTitle;
          meeting['color'] = colors.blue;
        }
        for (let meeting of this.allMeetings) {
          if (meeting['meetingStatus'] === 'no_response') {
            if (this.colorPicker(meeting)) {
              meeting['color'] = colors.yellow;
            }
            else {
              meeting['color'] = colors.blue;
            }
          }
          else if (meeting['meetingStatus'] === 'Accepted') {
            meeting['color'] = colors.green;
          }
          else if (meeting['meetingStatus'] === 'Declined') {
            meeting['color'] = colors.red;
          }
        }
        this.events = this.allMeetings;
      }
      else if (apiResult.status === 404) {
        this.deleteCookies();
        this.toastr.error(apiResult.message, '', { timeOut: 2050 });
        this.router.navigate(['/not-found'])
      }
      else if (apiResult.status === 403) {
        this.events = [];
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/server-error', 500]);
      }
    }, (err) => {
      this.toastr.error("Some Error Occured", '', { timeOut: 1050 });
      this.deleteCookies();
      this.router.navigate(['/server-error', 500]);
    })
  } // end of getMeetingDetails

  // sorting all meeting instances based on their start date/time
  meetingInstancesSort() {
    this.meetingInstances.sort(function (a: any, b: any) {
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

  // function to switch color for overlapping meeting instances
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

  // to get mail id of the user
  getUserDetail = () => {
    let data = {
      authToken: this.authToken,
      userId: this._route.snapshot.paramMap.get('participantId')
    }
    this.meetingService.getUserInfo(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.participantMail = apiResult.data.email;
        this.participantUserName = apiResult.data.userName;
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 2050 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['/not-found']);
      }
      else if (apiResult.status === 403) {
        this.toastr.error(apiResult.message, '', { timeOut: 2050 });
        this.socketService.exitSocket();
        this.router.navigate(['/user-selection']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.router.navigate(['/server-error', 500]);
      }
    }, (err) => {
      this.toastr.error("Some Error Occured", '', { timeOut: 1050 });
      this.deleteCookies();
      this.socketService.exitSocket();
      this.router.navigate(['/server-error', 500]);
    });
  } // end of getUserDetail

  // function to add meeting details
  addMeetingFunction(f: any) {
    let data = {
      authToken: this.authToken,
      adminId: this.userInfo.userId,
      adminName: this.userInfo.firstName + " " + this.userInfo.lastName,
      adminStatus: this.userInfo.adminStatus,
      adminMail: this.userInfo.email,
      participantId: this._route.snapshot.paramMap.get('participantId'),
      participantMail: this.participantMail,
      participantUserName: this.participantUserName,
      meetingTitle: this.createMeetingForm.controls.meetingTitle.value,
      meetingDescription: this.createMeetingForm.controls.meetingDescription.value,
      meetingLocation: this.createMeetingForm.controls.meetingLocation.value,
      meetingStart: new Date(this.createMeetingForm.controls.meetingStart.value).getTime(),
      meetingEnd: new Date(this.createMeetingForm.controls.meetingEnd.value).getTime()
    }
    this.meetingService.addMeeting(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 2500 });
        this.loading = true;
        setTimeout(() => {
          this.getMeetingDetails();
        }, 800);
        setTimeout(() => {
          // notification alert using sockets
          let meetingStartDate = new Date(this.createMeetingForm.controls.meetingStart.value).toLocaleDateString()
          let notificationObject = {
            toId: this._route.snapshot.paramMap.get('participantId'),
            notificationMessage: `New meeting scheduled to you. Check date ${meetingStartDate} or mail for more details`
          }
          this.socketService.sendUpdateNotification(notificationObject);
        }, 350);
      }
      else if (apiResult.status === 400) {
        this.toastr.error(apiResult.message, '', { timeOut: 1500 });
      }
      else if (apiResult.status === 403) {
        this.toastr.error(apiResult.message, '', { timeOut: 1500 });
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 1500 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['not-found']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1500 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.socketService.exitSocket();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    });
  } // end of addMeetingFunction

  // function to update meeting details
  updateMeetingFunction(f: any) {
    let data = {
      authToken: this.authToken,
      adminId: this.userInfo.userId,
      adminName: this.userInfo.firstName + " " + this.userInfo.lastName,
      adminStatus: this.userInfo.adminStatus,
      participantId: this._route.snapshot.paramMap.get('participantId'),
      participantMail: this.participantMail,
      meetingId: this.modalData?.event['meetingId'],
      meetingTitle: this.updateMeetingForm.controls.meetingUpdateTitle.value,
      meetingDescription: this.updateMeetingForm.controls.meetingUpdateDescription.value,
      meetingLocation: this.updateMeetingForm.controls.meetingUpdateLocation.value,
      meetingStart: new Date(this.updateMeetingForm.controls.meetingUpdateStart.value).getTime(),
      meetingEnd: new Date(this.updateMeetingForm.controls.meetingUpdateEnd.value).getTime()
    }
    this.meetingService.updateMeeting(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 2500 });
        this.loading = true;
        setTimeout(() => {
          this.getMeetingDetails();
        }, 800);
        setTimeout(() => {
          //notification alert using scockets
          let meetingStartDate = new Date(this.updateMeetingForm.controls.meetingUpdateStart.value).toLocaleDateString()
          let notificationObject = {
            toId: this._route.snapshot.paramMap.get('participantId'),
            notificationMessage: `A meeting has been updated. Check date ${meetingStartDate} or mail for more details`
          }
          this.socketService.sendUpdateNotification(notificationObject);
        }, 350);
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 2500 });
        this.deleteCookies();
        this.socketService.exitSocket(); this.socketService.exitSocket();
        this.router.navigate(['not-found']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 2500 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.socketService.exitSocket();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    })
  } // end of updateMeetingFunction

  // function to delete meeting detail
  deleteMeetingFunction() {
    let data = {
      authToken: this.authToken,
      adminId: this.userInfo.userId,
      adminStatus: this.userInfo.adminStatus,
      participantMail: this.participantMail,
      meetingId: this.modalData?.event['meetingId']
    }
    this.meetingService.deleteMeeting(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 2500 });
        this.loading = true;
        setTimeout(() => {
          this.getMeetingDetails();
        }, 800);
        setTimeout(() => {
          //notification alert using scockets
          let notificationObject = {
            toId: this._route.snapshot.paramMap.get('participantId'),
            notificationMessage: `A meeting has been cancelled. Check your mail for details.`
          }
          this.socketService.sendUpdateNotification(notificationObject);
        }, 350);
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 2500 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['not-found']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 2500 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.socketService.exitSocket();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    })
  } // end of deleteMeetingFunction

  // to change dropdown value based on selection and tooltip message on arrows
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
  logout = () => {
    let data = {
      userId: this.userInfo.userId,
      authToken: this.authToken
    }
    this.appService.userLogout(data).subscribe((apiResult) => {
      if (apiResult.status === 200) {
        this.toastr.success(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['/home']);
      }
      else if (apiResult.status === 404) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['/not-found']);
      }
      else if (apiResult.status === 403) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['/home']);
      }
      else if (apiResult.status === 500) {
        this.toastr.error(apiResult.message, '', { timeOut: 1050 });
        this.deleteCookies();
        this.socketService.exitSocket();
        this.router.navigate(['/server-error', 500]);
      }
    }, (err) => {
      this.deleteCookies();
      this.socketService.exitSocket();
      this.router.navigate(['server-error', 500]);
      this.toastr.error('Some error occured', '', { timeOut: 1500 });
    });
  } // end of logout
}