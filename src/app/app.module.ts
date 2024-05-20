import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire/compat';
import { environment } from './environment/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FindParkingComponent } from './find-parking/find-parking.component';
import { ReportParkingComponent } from './report-parking/report-parking.component';
import { ParkingFinderComponent } from './parking-finder/parking-finder.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ViewReservationsComponent } from './view-reservations/view-reservations.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FindParkingComponent,
    ReportParkingComponent,
    ParkingFinderComponent,
    LoginComponent,
    SignupComponent,
    ViewReservationsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
