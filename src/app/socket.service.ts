import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'http://api.meetingbee.online';

  // private url = 'http://localhost:3999';

  private socket: any;

  constructor(public http: HttpClient) {
    this.socket = io(this.url, { 'transports': ['websocket'] });
  }

  public startConnection = () => {
    return new Observable((observer) => {
      this.socket = io(this.url);
      observer.next();
    })
  } // end of startConnection

  public verifyUser = () => {
    return new Observable((observer) => {
      this.socket.on('verifyUser', (data: any) => {
        observer.next(data);
      });
    });
  } // end of verifyUser

  public setUser = (authToken: any) => {
    this.socket.emit('set-user', authToken);
  } // end of setUser

  public receiveRealTimeNotifications = (userId: any) => {
    return new Observable((observer) => {
      this.socket.on(userId, (data: any) => {
        observer.next(data);
      })
    })
  } // end of receiveRealTimeNotifications

  public sendUpdateNotification = (notificationObject) => {
    this.socket.emit('update-notification', notificationObject)
  } // end of sendUpdateNotification

  public exitSocket = () => {
    this.socket.disconnect();
  } // end of exitSocket

}
