import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Location } from '../interfaces/location';


@Injectable({
  providedIn: 'root'
})
export class UserLocationService {
  private userLocationSubject = new BehaviorSubject<Location | null>(null);
  public userLocation = this.userLocationSubject.asObservable();

  private selectedLocationSubject = new BehaviorSubject<Location | null>(null);
  public selectedLocation = this.selectedLocationSubject.asObservable();
  constructor() {}
  
  setUserLocation(location : Location) {
    this.userLocationSubject.next(location)
  }

  setSelectedLocation(location : Location){
    this.selectedLocationSubject.next(location)
  }
}
