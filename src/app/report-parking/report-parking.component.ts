import { Component } from '@angular/core';
import * as L from 'leaflet';
import { UserLocationService } from '../services/user-location.service';
import { Location } from '../interfaces/location';
import { delay } from 'rxjs';
import { ParkingDataService } from '../services/parking-data.service';
import { ParkingSpot } from '../interfaces/parkingSpot';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserInformation } from '../interfaces/user';

@Component({
  selector: 'app-report-parking',
  templateUrl: './report-parking.component.html',
  styleUrls: ['./report-parking.component.css']
})
export class ReportParkingComponent {
  map!: L.Map;
  userLocation : Location;
  parkingSpots: ParkingSpot[] = [];
  parkingType : any = "";
  selectedSpot!: ParkingSpot;
  errorCheck : boolean = false
  isBikePopupVisible : boolean = false
  isCarPopupVisible : boolean = false
  reportedBikeInformation : any
  reportedCarInformation! : ParkingSpot
  isEVSelected! : boolean;

  loggedIn : boolean = false;
  userInfo : UserInformation;
  showLoginPopup : boolean = false;

  showInfoPopup : boolean = false;

  userClickLocation : Location
  otherSelected : boolean = false

  constructor(private userLocationService : UserLocationService, private parkingDataService : ParkingDataService, private router : Router, private userService : UserService){
    this.userLocation = {lat : undefined, long: undefined}
    this.userClickLocation = {lat : undefined, long : undefined}
    this.userInfo = {name : "", password : "", email : ""}
  }

  onClickInfoButton(){
    this.showInfoPopup = true;
  }

  closeInfoPopup(){
    this.showInfoPopup = false;
  }

  selectParkingType(type : string){
    if(!this.loggedIn){
      this.showLoginPopup = true;
      return;
    }
    this.parkingType = type;
  }

  closeLoginPopup(){
    this.showLoginPopup = false;
  }

  navigatePage(path : string){
    this.router.navigateByUrl(path)
  }

  carErrorChecking(name : any, slotsAvailable : any, totalSlots : any, cost : any){
    if(name == "") return false
    if(slotsAvailable > totalSlots) return false
    if(cost < 0 || slotsAvailable < 0 || totalSlots < 0) return false
    return true
  }

  populateCarInformation(){
    this.userLocationService.selectedLocation.subscribe(data => {
      this.reportedCarInformation.latlng = [data?.lat, data?.long]
      if(this.isCarPopupVisible) this.parkingDataService.storeParkingInfo(this.reportedCarInformation)
    })
    this.closeCarPopup()
    this.parkingType = ''
  }

  openCarPopup(){
    if(this.otherSelected){
      var name = (document.getElementById("car-name") as HTMLInputElement).value;
      var slotsAvailable = parseInt((document.getElementById("car-availableSlots") as HTMLInputElement).value, 10);
      var size = (document.getElementById("size") as HTMLInputElement).value;
      var totalSlots = parseInt((document.getElementById("car-totalSlots") as HTMLInputElement).value, 10);
      var cost = parseInt((document.getElementById("cost") as HTMLInputElement).value, 10);
      var parkingCondition = (document.getElementById("parking-condition") as HTMLInputElement).value;

      if(!this.carErrorChecking(name, slotsAvailable, totalSlots, cost)){
        this.errorCheck = true
        return
      }
      this.errorCheck = false

      this.reportedCarInformation = {name : name, latlng : "" , spotsAvailable : slotsAvailable, sizeOfSpot : size, totalSpots : totalSlots, cost : cost, parkingCondition : parkingCondition, isBikeRack : false, evAvilable : this.isEVSelected}
    } else{
      if(this.selectedSpot.spotsAvailable >= this.selectedSpot.totalSpots){
        this.errorCheck = true
        return
      }
      this.errorCheck = false
    }
    
    this.isCarPopupVisible = true
    // if(!this.bikeErrorChecking(name, slotsAvailable, totalSlots)){
    //   this.errorCheck = true
    //   return
    // }
    // this.errorCheck = false

    // this.reportedBikeInformation = {name : name, slotsAvailable : slotsAvailable, totalSlots : totalSlots}
    // this.isBikePopupVisible = true
  }

  closeCarPopup(){
    this.isCarPopupVisible = false
  }
  
  bikeErrorChecking(name : string, slotsAvailable : number, totalSlots : number){
    if(name == "") return false
    if(slotsAvailable > totalSlots) return false
    if(slotsAvailable < 0 || totalSlots < 0) return false
    return true
  }

  openBikePopup(){
    if(this.otherSelected){
      var name = (document.getElementById("bike-name") as HTMLInputElement).value;
      var slotsAvailable = parseInt((document.getElementById("bike-availableSlots") as HTMLInputElement).value, 10);
      var totalSlots = parseInt((document.getElementById("bike-totalSlots") as HTMLInputElement).value, 10);

      if(!this.bikeErrorChecking(name, slotsAvailable, totalSlots)){
        this.errorCheck = true
        return
      }
      this.errorCheck = false

      this.reportedBikeInformation = {name : name, slotsAvailable : slotsAvailable, totalSlots : totalSlots}
    } else{
      if(this.selectedSpot.spotsAvailable >= this.selectedSpot.totalSpots){
        this.errorCheck = true
        return
      }
      this.errorCheck = false
    }
    this.isBikePopupVisible = true
  }

  closeBikePopup(){
    this.isBikePopupVisible = false
  }

  increaseAvailability(): void {
    if (!this.selectedSpot || !this.selectedSpot.id) {
      console.error("No parking spot selected or ID is missing");
      return;
    }
  
    const newSpotsAvailable = this.selectedSpot.spotsAvailable + 1;
  
    if (newSpotsAvailable > this.selectedSpot.totalSpots) {
      console.error("Cannot exceed total spots available");
      return;
    }
  
    this.parkingDataService.incrementParkingSpotAvailability(this.selectedSpot.id, newSpotsAvailable)
      .then(() => console.log("Updated spots available successfully"))
      .catch(error => console.error("Error updating spots available:", error));

    if(this.isCarPopupVisible) this.isCarPopupVisible = false
    if(this.isBikePopupVisible) this.isBikePopupVisible = false
  }
  

  populateBikeInformation(){
    this.userLocationService.selectedLocation.subscribe(data => {
      const parkingInformation = {
        name : this.reportedBikeInformation.name,
        latlng : [data?.lat, data?.long],
        totalSpots : this.reportedBikeInformation.totalSlots,
        spotsAvailable : this.reportedBikeInformation.slotsAvailable,
        cost : 0,
        sizeOfSpot : "",
        isBikeRack : true,
      }
      if(this.isBikePopupVisible) this.parkingDataService.storeParkingInfo(parkingInformation)
    })
    this.closeBikePopup()
    this.parkingType = ''
    // this.parkingDataService.storeParkingInfo(parkingInformation)
  }

  onSpotSelected(e : Event){
    const selectElement = e.target as HTMLSelectElement | null;
    if(selectElement!.value == "other"){
      this.map.setView([this.userLocation.lat, this.userLocation.long], 25);
      this.otherSelected = true
      return
    }
    else{
      this.otherSelected = false
    }

    for(let spot of this.parkingSpots){
      if(spot.id == selectElement!.value){
        this.map.setView([spot.latlng[0], spot.latlng[1]], 25);
        this.selectedSpot = spot;
        break
      }
    }
  }

  ngOnInit() {
    this.userService.userInfo.subscribe(data=>{
      if(data){
        this.userInfo = data;
        this.loggedIn = true;
      }
    })
    if(this.userLocation.lat != undefined){
      this.displayMap(this.userLocation.lat, this.userLocation.long)
    }

    this.userLocationService.userLocation.subscribe(data => {
      this.userLocation.lat = data?.lat
      this.userLocation.long = data?.long
      this.userLocationService.setSelectedLocation({lat: this.userLocation.lat, long: this.userLocation.long})
      this.displayMap(this.userLocation.lat, this.userLocation.long)
    })    
    this.parkingDataService.getParkingSpots().subscribe((spots: ParkingSpot[]) => {
      this.parkingSpots = spots;
      this.displayMarkers();
    });
  }

  displayMarkers(){
    if(!this.map) return
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

    for(let spot of this.parkingSpots){
      if(spot.isBikeRack){
        L.marker([spot.latlng[0], spot.latlng[1]], {icon: bikeIcon}).addTo(this.map).bindPopup(`${spot.name} <br/> Slots Available: ${spot.spotsAvailable}`)
        continue
      }
      L.marker([spot.latlng[0], spot.latlng[1]], {icon: carIcon}).addTo(this.map).bindPopup(`${spot.name} <br/> Slots Available: ${spot.spotsAvailable}`)
    }
  }

  userSelectedLocation(){
    let clickMarker : any = null;
    var userIcon = L.icon({
      iconUrl: 'assets/userIcon.webp',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    this.userLocationService.userLocation.subscribe(data => {
      clickMarker = L.marker([data?.lat, data?.long], {icon: userIcon})
            .addTo(this.map)
            .bindPopup("");
    })

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;
    
      this.userClickLocation = { lat: clickedLat, long: clickedLng };
      this.userLocationService.setSelectedLocation(this.userClickLocation)
      
      this.userLocationService.selectedLocation.subscribe(data =>{
        if (clickMarker) {
          clickMarker.setLatLng(e.latlng);
        } else {
          clickMarker = L.marker([data?.lat, data?.long], {icon: userIcon})
            .addTo(this.map)
            .bindPopup("");
        }
      })
    });
  }

  displayMap(lat : any, long : any) : void {
    if (this.map) {
      this.map.setView([lat, long], 25);
      return;
    }
    if(this.userLocation.lat == undefined) return
    
    this.map = L.map('map').setView([lat, long], 25);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.userSelectedLocation()
  }

  evDivClicked(selectedVal : boolean){
    console.log(`Before toggle: ${this.isEVSelected}`);
    this.isEVSelected = selectedVal;
    console.log(`After toggle: ${this.isEVSelected}`);
  }
}
