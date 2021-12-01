import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private url = "https://meetingbee-backend.herokuapp.com";

  //private url = 'http://api.meetingbee.online';

  //private url = 'http://localhost:3999';

  constructor(
    public http: HttpClient
  ) { }

  //get user info from local storage
  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo')!);
  }

  //set user info on local storage 
  public setUserInfoInLocalStorage = (data: any) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public signupFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('userName', data.userName)
      .set('adminStatus', data.adminStatus)
      .set('mobileNumber', data.mobileNumber)
      .set('country', data.country)
      .set('email', data.email)
      .set('password', data.password)

    return this.http.post(`${this.url}/api/v1/user/signup`, params);
  } // end of signupFunction

  public loginFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.url}/api/v1/user/login`, params);
  } //end of loginFunction

  public editUserPassword(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('userId', data.userId)
      .set('newPassword', data.newPassword)
      .set('firstCheck', data.firstCheck)

    return this.http.post(`${this.url}/api/v1/user/editUserPassword`, params);
  } // end of editUserPassword

  public sendMail(data: any): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email);

    return this.http.post(`${this.url}/api/v1/user/send-mail`, params);
  } // end of sendMail

  public checkAuth(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('firstCheck', data.firstCheck);

    return this.http.post(`${this.url}/api/v1/user/auth-check`, params);
  } // end of checkAuth

  public userLogout(data: any): Observable<any> {
    const params = new HttpParams()
      .set('userId', data.userId)
      .set('authToken', data.authToken);

    return this.http.post(`${this.url}/api/v1/user/logout`, params);
  } // end of userLogout

}
