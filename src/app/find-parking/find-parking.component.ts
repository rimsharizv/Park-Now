import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { UserLocationService } from '../services/user-location.service';
import { Location } from '../interfaces/location';
import { delay } from 'rxjs';
import { ParkingDataService } from '../services/parking-data.service';
import { ParkingSpot } from '../interfaces/parkingSpot';
import { UserInformation } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-find-parking',
  templateUrl: './find-parking.component.html',
  styleUrls: ['./find-parking.component.css']
})
export class FindParkingComponent {
  map!: L.Map;
  userLocation : Location;
  selectedUserLocation : Location;
  selectedLocationName : string = "Current Location";
  parkingSpots: ParkingSpot[] = [];
  filteredParkingSpots : ParkingSpot[] = [];
  vehicleSelected : string = "";
  isEVSelected : string = ""
  sizeOfSpot : string = "";
  parkingCondition : string = "";
  selectedParkingSpot! : ParkingSpot;
  noSelectedError : boolean = false;
  errorCheck : boolean = false;
  isPopupVisible : boolean = false;
  searchQuery : string = "";
  userInfo : UserInformation;
  loggedIn : boolean = false;
  showLoginPopup : boolean = false;
  showConfirmPopup : boolean = false;
  distance : number = -1;
  timeToDestination : any;
  timeError : boolean = false;

  markers: { [key: string]: L.Marker } = {};

  times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30','12:00', '12:30','13:00', '13:30','14:00', '14:30','15:00', '15:30','16:00', '16:30','17:00', '17:30','18:00', '18:30','19:00', '19:30','20:00', '20:30','21:00', '21:30','22:00', '22:30','23:00', '23:30']
  availableTimes: string[] = [];
  selectedTime : string = '';

  autocompleteInput: string = '';
  queryWait?: boolean;

  @ViewChild('autocomplete', { static: true }) autocompleteField!: ElementRef;

  constructor(private ngZone: NgZone, private router : Router,private userLocationService : UserLocationService, private parkingDataService : ParkingDataService, private userService : UserService){
    this.userLocation = {lat : undefined, long: undefined}
    this.selectedUserLocation = {lat : undefined, long: undefined}
    this.userInfo = {name : "", password: "", email: ""}
  }

  resetFilter(){
    this.vehicleSelected = ""
    this.sizeOfSpot = ""
    this.isEVSelected = ""
    this.parkingCondition = ""

    let filteredSpots = [...this.parkingSpots];
    this.filteredParkingSpots = filteredSpots;
    this.displayMarkers()
  }

  filterParkingSpots(): void {
    console.log("works")
    let filteredSpots = [...this.parkingSpots];
  
    if (this.vehicleSelected === 'bicycle') {
      filteredSpots = filteredSpots.filter(spot => spot.isBikeRack);
    } else if (this.vehicleSelected === 'car') {
      filteredSpots = filteredSpots.filter(spot => !spot.isBikeRack);
    }

    if (this.isEVSelected == 'true') {
      filteredSpots = filteredSpots.filter(spot => spot.evAvilable);
    } else if (this.isEVSelected == 'false') {
      filteredSpots = filteredSpots.filter(spot => !spot.evAvilable);
    }

    if (this.sizeOfSpot) {
      filteredSpots = filteredSpots.filter(spot => spot.sizeOfSpot === this.sizeOfSpot);
    }

    if (this.parkingCondition) {
      filteredSpots = filteredSpots.filter(spot => spot.parkingCondition === this.parkingCondition);
    }

    if (this.searchQuery != '') {
      filteredSpots = filteredSpots.filter(spot => spot.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  
    this.filteredParkingSpots = filteredSpots;
  
    this.displayMarkers();
  }

  setParkingCondition(str : string){
    if(this.parkingCondition == str){
      this.parkingCondition = ""
      this.filterParkingSpots()
      return
    }
    this.parkingCondition = str;
    this.filterParkingSpots()
  }


  setSizeOfSpot(str : string){
    if(this.sizeOfSpot == str){
      this.sizeOfSpot = ""
      this.filterParkingSpots()
      return
    }
    this.sizeOfSpot = str;
    this.filterParkingSpots()
  }

  setEVSelected(str : string){
    if(this.isEVSelected == str){
      this.isEVSelected = ""
      this.filterParkingSpots()
      return
    }
    this.isEVSelected = str
    this.filterParkingSpots()
  }

  setVehicleSelected(str : string){
    if(this.vehicleSelected == str){
      this.vehicleSelected = ""
      this.filterParkingSpots()
      return
    }
    this.vehicleSelected = str;
    if(str == 'bicycle'){
      this.sizeOfSpot = ""
      this.isEVSelected = ""
      this.parkingCondition = ""
    }
    let filteredSpots = [...this.parkingSpots];
    this.filteredParkingSpots = filteredSpots
    this.filterParkingSpots()
  }

  ngOnInit() {
    this.userService.userInfo.subscribe(data => {
      if(data){
        this.userInfo = data
        this.loggedIn = true
      }
    })

    if(this.userLocation.lat != undefined){
      this.displayMap(this.userLocation.lat, this.userLocation.long)
    }

    this.userLocationService.userLocation.subscribe(data => {
      this.userLocation.lat = data?.lat
      this.userLocation.long = data?.long
      this.selectedUserLocation = this.userLocation
      this.displayMap(this.userLocation.lat, this.userLocation.long)
    })    
    this.parkingDataService.getParkingSpots().subscribe((spots: ParkingSpot[]) => {
      this.parkingSpots = spots;
      this.filteredParkingSpots = this.parkingSpots
      this.displayMarkers();
    });
    this.setupPlaceAutocomplete();
    this.updateAvailableTimes();
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

    Object.values(this.markers).forEach(marker => marker.remove());
    this.markers = {};
  
    for(let spot of this.filteredParkingSpots){
      let marker = L.marker([spot.latlng[0], spot.latlng[1]], {icon: spot.isBikeRack ? bikeIcon : carIcon})
        .bindPopup(`${spot.name} <br/> Slots Available: ${spot.spotsAvailable}`);
      
      marker.addTo(this.map);
      this.markers[spot.id!] = marker; // Store the marker with reservation ID as key
    }
  }

  displayMap(lat : any, long : any) : void {
    if(this.userLocation.lat == undefined) return
    
    this.map = L.map('map').setView([lat, long], 25);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  confirmSpot(){
    if(this.selectedTime == ''){
      this.timeError = true;
      return
    }
    this.timeError = false;

    if (!this.selectedParkingSpot || !this.selectedParkingSpot.id) {
      console.error("No parking spot selected or ID is missing");
      return;
    }
  
    const newSpotsAvailable = this.selectedParkingSpot.spotsAvailable - 1;

    if(newSpotsAvailable == -1){
      return
    }
  
    if (newSpotsAvailable > this.selectedParkingSpot.totalSpots) {
      console.error("Cannot exceed total spots available");
      return;
    }
  
    this.parkingDataService.updateParkingSpotAvailability(this.selectedParkingSpot.id, newSpotsAvailable, this.selectedTime)
      .then(() => console.log("Updated spots available successfully"))
      .catch(error => console.error("Error updating spots available:", error));

    this.closePopup()
    this.showConfirmPopup = true;
  }

  closeLoginPopup(){
    this.showLoginPopup = false
  }

  closePopup(){
    this.isPopupVisible = false
    this.showConfirmPopup = false;
  }

  submitButton(){
    this.userService.userInfo.subscribe(data=>{
      if(data?.name == undefined){
        this.loggedIn = false;
        this.showLoginPopup = true;
        return
      }
    })

    if(this.loggedIn == false){
      this.showLoginPopup = true;
      return
    }
    
    if(!this.selectedParkingSpot){
      this.noSelectedError = true
      return
    }
    this.noSelectedError = false
    if(this.selectedParkingSpot.spotsAvailable >= this.selectedParkingSpot.totalSpots || this.selectedParkingSpot.spotsAvailable == 0){
      this.errorCheck = true
      return
    }
    this.errorCheck = false

    this.isPopupVisible = true
  }

  clickOnParking(parkingSpot : ParkingSpot){
    this.selectedParkingSpot = parkingSpot
    if(this.map){
      this.map.setView([parkingSpot.latlng[0], parkingSpot.latlng[1]], 20);
    }
    this.distance = this.calculateDistance()
    this.timeToDestination = this.calculateTimeTaken()
  }

  navigatePage(path : string){
    this.router.navigateByUrl(path)
  }

  setupPlaceAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.autocompleteField.nativeElement, {
      types: ["geocode"], // Specify the type of data to retrieve
    });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and pressed the Enter key, or the Place Details request failed.
          console.error('No details available for input: ' + place.name);
          return;
        }
        this.selectedLocationName = place.name
        // place.geometry.location contains the LatLng object.
        this.selectedUserLocation.lat = place.geometry.location.lat();
        this.selectedUserLocation.long = place.geometry.location.lng();
        if(this.map){
          this.map.setView([this.selectedUserLocation.lat, this.selectedUserLocation.long], 25);
        }
        this.distance = this.calculateDistance()
        this.timeToDestination = this.calculateTimeTaken()
        // You can trigger any action on selecting the place from suggestions here
      });
    });
  }

  calculateDistance(): number {
    console.log(this.selectedUserLocation)
    if(this.selectedParkingSpot && this.selectedUserLocation){
      const R = 3958.8;
      const rad = Math.PI / 180;
      // selecteduserlocation = 1, selectedparking = 2
      const dLat = (this.selectedParkingSpot.latlng[0] - this.selectedUserLocation.lat) * rad;
      const dLon = (this.selectedParkingSpot.latlng[1] - this.selectedUserLocation.long) * rad;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.selectedUserLocation.lat * rad) * Math.cos(this.selectedParkingSpot.latlng[0] * rad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return parseFloat((R * c).toFixed(2));
    }
    else return -1
  }

  calculateTimeTaken() : string{
    let time = this.distance / 30;
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    if(hours > 0){
      return `${hours} hour(s) and ${minutes} minute(s)`;
    } else{
      return `${minutes} minute(s)`
    }
  }

  onClickCurrentLocation(){
    this.userLocationService.userLocation.subscribe(data => {
      this.userLocation.lat = data?.lat
      this.userLocation.long = data?.long
      this.selectedUserLocation = this.userLocation

      if(this.map){
        this.map.setView([this.selectedUserLocation.lat, this.selectedUserLocation.long], 25);
      }
      this.selectedLocationName = "Current Location"
      this.distance = this.calculateDistance()
      this.timeToDestination = this.calculateTimeTaken()
    })
  }

  updateAvailableTimes() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    this.availableTimes = this.times.filter(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours > currentHour || (hours === currentHour && minutes > currentMinutes);
    });
  }
}
