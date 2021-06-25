import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LoadingBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    LoadingBarComponent,
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
