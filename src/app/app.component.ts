import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { delay } from 'rxjs';
import { UserLocationService } from './services/user-location.service';
import { Location } from './interfaces/location';
import { UserService } from './services/user.service';
import { UserInformation } from './interfaces/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'park-now'
  isLoaded : boolean = true
  showAppBar : boolean = false
  loggedIn : boolean = false;
  userInfo : UserInformation;
  pagesForNoAppBar = ['/', '/signup', '/login'];
  selectedPage! : string;

  constructor(private router : Router, private userLocationService : UserLocationService, private userService : UserService){
    this.userInfo = {name : "", password : "", email : ""}
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.selectedPage = event.url;
        this.showAppBar = !this.pagesForNoAppBar.includes(this.selectedPage);
      }
    });
  }

  async ngOnInit(){
    this.getUserLocation()
    if(this.userService.userInfo.subscribe(data =>{
      if(data){
        this.userInfo = data;
        this.loggedIn = true;
      }
    }))
  
    await this.delay(2000);
    const loadingImageElement = document.querySelector('.loading-image');
    loadingImageElement?.classList.add('fade-out');
    this.isLoaded = true;

  }

  logout(){
    this.userService.logout();
    this.userInfo = {name : undefined, password : undefined, email : undefined};
    this.userService.setUserInfo(this.userInfo);
    this.loggedIn = false;
  }

  getUserLocation(){
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        var userLocation : Location = {lat: position.coords.latitude, long: position.coords.longitude};
        this.userLocationService.setUserLocation(userLocation)
      }, (error) => {
          console.error('Error occurred. Error code: ' + error.code);
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  navigatePage(path : string){
    this.router.navigateByUrl(path)
  }
}
