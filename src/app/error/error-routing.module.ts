import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error.component';


const errorRoutes: Routes = [
    {
        path: 'not-found',
        component: ErrorComponent
    }, {
        path: 'server-error/:error',
        component: ErrorComponent
    },
    {
        path: '*',
        component: ErrorComponent
    },
    {
        path: '**',
        component: ErrorComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(errorRoutes)],
    exports: [RouterModule]
})
export class ErrorRoutingModule { }