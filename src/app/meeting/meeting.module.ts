import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserSelectionComponent } from './user-selection/user-selection.component';

@NgModule({
  declarations: [
    UserDashboardComponent,
    UserSelectionComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MeetingModule { }
