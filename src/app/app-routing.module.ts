import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FindParkingComponent } from './find-parking/find-parking.component';
import { ReportParkingComponent } from './report-parking/report-parking.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ViewReservationsComponent } from './view-reservations/view-reservations.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'find-parking', component: FindParkingComponent},
  {path: 'report-parking', component: ReportParkingComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: LoginComponent},
  {path: 'view-reservations', component: ViewReservationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
