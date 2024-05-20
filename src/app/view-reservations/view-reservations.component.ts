import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { UserService } from '../services/user.service';
import { ParkingDataService } from '../services/parking-data.service';
import { Reservation } from '../interfaces/reservation';
import { ParkingSpot } from '../interfaces/parkingSpot';
import { UserReservation } from '../interfaces/userReservation';

import { OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { UserLocationService } from '../services/user-location.service';
import { Location } from '../interfaces/location';

@Component({
  selector: 'app-view-reservations',
  templateUrl: './view-reservations.component.html',
  styleUrls: ['./view-reservations.component.css']
})
export class ViewReservationsComponent {
  map!: L.Map;
  userLocation : Location;
  reservedSpots : UserReservation[] = [];
  markers: { [key: string]: L.Marker } = {};
  constructor(private router : Router, private userLocationService : UserLocationService,  private userService : UserService, private parkingService : ParkingDataService){
    this.userLocation = {lat : undefined, long: undefined}
  }

  ngOnInit() {

    if(this.userLocation.lat != undefined){
      this.displayMap(this.userLocation.lat, this.userLocation.long)
    }
    else{
      this.userLocationService.userLocation.subscribe(data => {
        this.userLocation.lat = data?.lat
        this.userLocation.long = data?.long
        this.displayMap(this.userLocation.lat, this.userLocation.long)
      }) 
    }
    this.populateReservations()
  }

  populateReservations(){
    this.reservedSpots = []
    this.userService.userInfo.subscribe(data => {
      if (data?.id) {
        this.parkingService.fetchAndStoreReservations(data.id);
        this.parkingService.reservations$.subscribe(res => {
          if (res) {
            this.parkingService.getParkingSpots().subscribe(parking => {
              if (parking) {
                this.reservedSpots = []; // Clear existing reservations
                for (let r of res) {
                  for (let p of parking) {
                    if (r.spotID == p.id) {
                      this.reservedSpots.push({ parkingSpot: p, spotID: r.spotID, date: r.date, id: r.id, time : r.time });
                    }
                  }
                }
                this.reservedSpots.sort((a, b) => {
                  const dateA = new Date(a.date.replace(/-/g, '/'));
                  const dateB = new Date(b.date.replace(/-/g, '/'));
                
                  return dateB.getTime() - dateA.getTime();
                });
                this.displayMarkers()
              }
            });
          }
        });
      }
    });
  }
  
  displayMarkers(){
    var carIcon = L.icon({
      iconUrl: 'assets/marker.webp',
      iconSize: [38, 38],
      iconAnchor: [19,38],
      popupAnchor: [0,-38]
    });
    var bikeIcon = L.icon({
      iconUrl: 'assets/green-marker.png',
      iconSize: [38, 38],
      iconAnchor: [19,38],
      popupAnchor: [0,-38]
    });
  
    // Clear existing markers from the map
    Object.values(this.markers).forEach(marker => marker.remove());
    this.markers = {};
  
    for(let s of this.reservedSpots){
      let spot = s.parkingSpot;
      let marker = L.marker([spot.latlng[0], spot.latlng[1]], {icon: spot.isBikeRack ? bikeIcon : carIcon})
        .bindPopup(`${spot.name} <br/> Slots Available: ${spot.spotsAvailable}`);
      
      marker.addTo(this.map);
      this.markers[s.id!] = marker; // Store the marker with reservation ID as key
    }
  }
  

  displayMap(lat : any, long : any) : void {
    if(this.userLocation.lat == undefined) return
    this.map = L.map('map').setView([lat, long], 25);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  clickOnParking(parkingSpot : ParkingSpot){
    if(this.map){
      this.map.setView([parkingSpot.latlng[0], parkingSpot.latlng[1]], 20);
    }
  }

  deleteReservation(id : string){
    this.parkingService.deleteReservation(id);
    this.populateReservations()
  }
}
