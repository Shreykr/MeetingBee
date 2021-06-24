import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private url = 'http://localhost:3000';

  constructor(
    public http: HttpClient
  ) { }

  public getMeetingDetails(data: any): Observable<any> {
    const params = new HttpParams()
      .set('authToken', data.authToken)
      .set('participantId', data.participantId)
      .set('userId', data.userId)

    return this.http.post(`${this.url}/api/v1/meeting/user-meetings`, params);
  } // end of getAllUserDetails

}
