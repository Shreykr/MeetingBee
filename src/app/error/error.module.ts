import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ErrorComponent } from './error.component';
import { ErrorRoutingModule } from './error-routing.module';



@NgModule({
    declarations: [
        ErrorComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        ErrorRoutingModule
    ]
})
export class ErrorModule { }
