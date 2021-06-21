import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-general-nav',
  templateUrl: './general-nav.component.html',
  styleUrls: ['./general-nav.component.css']
})
export class GeneralNavComponent implements OnInit {

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

  constructor() { }

  ngOnInit(): void {
  }

}
