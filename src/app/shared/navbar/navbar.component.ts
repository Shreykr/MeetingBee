import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {

  // variables to store screen sizes
  public status?: Boolean = false;
  public scrHeight = window.innerHeight;
  public scrWidth = window.innerWidth;
  public detectScroll!: Boolean;
  public general: Boolean = false;
  public admin: Boolean = false;
  public user: Boolean = false;

  @Input() navSwitcher: number;

  @Output()
  logoutClick: EventEmitter<any> = new EventEmitter<any>();

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.detectScroll = true;
    if (scrollY === 0) {
      this.detectScroll = false;
    }
  }

  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
    this.navChecker()
  }

  navChecker() {
    if (this.navSwitcher === 1) {
      this.general = true;
      this.admin = false;
      this.user = false;
    }
    else if (this.navSwitcher === 2) {
      this.general = false;
      this.admin = false;
      this.user = true;
    }
    else if (this.navSwitcher === 3) {
      this.general = false;
      this.admin = true;
      this.user = false;
    }
  }

  logoutClicked() {
    this.logoutClick.emit();
  }

  navigateToUserSelection() {
    this.router.navigate(['/user-selection'])
  }
}
