import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

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

  constructor(public router: Router) { }

  ngOnInit(): void { }

  // function to navigate to signup route
  public navigateToSignUp: any = () => {
    setTimeout(() => {
      this.router.navigate(['/signup']);
    }, 500);
  } // end of navigateToSignUp
}
