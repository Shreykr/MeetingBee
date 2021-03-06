import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})

export class MeetingService {

  private url = "https://meetingbee-backend.herokuapp.com";

  //private url = 'http://api.meetingbee.online';

  //private url = 'http://localhost:3999';

  constructor(
    public http: HttpClient
  ) { }

  public getMeetingDetails(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('participantId', data.participantId)
      .set('userId', data.userId)

    return this.http.post(`${this.url}/api/v1/meeting/user-meetings`, params);
  } // end of getMeetingDetails

  public getAllUsers(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('userId', data.userId)

    return this.http.post(`${this.url}/api/v1/user/view/all-users`, params);
  } // end of getAllUsers

  public getUserInfo(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('userId', data.userId)

    return this.http.post(`${this.url}/api/v1/user/view/get-user-detail`, params);
  } // end of getUserInfo

  public addMeeting(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('adminId', data.adminId)
      .set('adminName', data.adminName)
      .set('adminMail', data.adminMail)
      .set('adminStatus', data.adminStatus)
      .set('participantId', data.participantId)
      .set('participantMail', data.participantMail)
      .set('participantUserName', data.participantUserName)
      .set('meetingTitle', data.meetingTitle)
      .set('meetingDescription', data.meetingDescription)
      .set('meetingLocation', data.meetingLocation)
      .set('meetingStart', data.meetingStart)
      .set('meetingEnd', data.meetingEnd)

    return this.http.post(`${this.url}/api/v1/meeting/add-meeting`, params);
  } // end of addMeeting

  public updateMeeting(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('adminId', data.adminId)
      .set('adminName', data.adminName)
      .set('adminStatus', data.adminStatus)
      .set('participantId', data.participantId)
      .set('participantMail', data.participantMail)
      .set('meetingId', data.meetingId)
      .set('meetingTitle', data.meetingTitle)
      .set('meetingDescription', data.meetingDescription)
      .set('meetingLocation', data.meetingLocation)
      .set('meetingStart', data.meetingStart)
      .set('meetingEnd', data.meetingEnd)

    return this.http.post(`${this.url}/api/v1/meeting/update-meeting`, params);
  } // end of updateMeeting

  public updateMeetingStatus(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('adminStatus', data.adminStatus)
      .set('participantId', data.participantId)
      .set('meetingId', data.meetingId)
      .set('adminMail', data.adminMail)
      .set('meetingStatus', data.meetingStatus)

    return this.http.post(`${this.url}/api/v1/meeting/update-meeting-user`, params);
  } // end of updateMeetingStatus

  public deleteMeeting(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('adminId', data.adminId)
      .set('adminStatus', data.adminStatus)
      .set('participantMail', data.participantMail)
      .set('meetingId', data.meetingId)

    return this.http.post(`${this.url}/api/v1/meeting/delete-meeting`, params);
  } // end of deleteMeeting

}
