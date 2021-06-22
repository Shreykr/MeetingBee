import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  public status?: Boolean;
  public scrHeight = window.innerHeight;
  public scrWidth = window.innerWidth;
  public detectScroll!: Boolean;
  public error404: Boolean = true;
  public error500: Boolean = false;
  public toggleValue;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.detectScroll = true;
    if (scrollY === 0) {
      this.detectScroll = false;
    }
  }

  constructor(
    public _route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.toggleValue = this._route.snapshot.paramMap.get('error');
    if (Number(this.toggleValue) === 500) {
      this.error404 = false;
      this.error500 = true;
    }
    else {
      this.error404 = true;
      this.error500 = false;
    }
  }

}
