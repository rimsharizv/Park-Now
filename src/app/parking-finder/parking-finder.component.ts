import { Component } from '@angular/core';
import { ParkingDataService } from '../services/parking-data.service';
declare let google: any;

//////////////////
// This is not used in the project
// Component is only used to get data from google maps Places API and store it in the firebase database.

@Component({
  selector: 'app-parking-finder',
  templateUrl: './parking-finder.component.html',
  styleUrls: ['./parking-finder.component.css']
})
export class ParkingFinderComponent {
  constructor(private parkingService : ParkingDataService){}

  ngOnInit() {
    this.initMap();
  }


  initMap(): void {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 41.87478, lng: -87.65088 },
      zoom: 8,
    });

    const bikeStandRequest = {
      location: map.getCenter(),
      radius: '12000',
      keyword: 'bycicle rack'
    };

    const request = {
      location: map.getCenter(),
      radius: '12000',
      type: ['parking']
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(bikeStandRequest, (results : any, status : any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
          const spotsAvailable = Math.floor(Math.random() * (Math.floor(12) - Math.ceil(0)) + Math.ceil(0));
          const totalSpots = Math.floor(Math.random() * (Math.floor(12) - Math.ceil(8)) + Math.ceil(8));
          const cost =  0;
          var sizeOfSpot = ""

          const parkingSpot = {name : results[i].name,
             latlng: [results[i].geometry.location.lat(), results[i].geometry.location.lng()],
              spotsAvailable : spotsAvailable,
              totalSpots : totalSpots,
              cost : cost,
              sizeOfSpot : sizeOfSpot,
              isBikeRack : true}
          this.storeParkingInfo(parkingSpot)
        }
      }
    });


    service.nearbySearch(request, (results : any, status : any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
          const spotsAvailable = Math.floor(Math.random() * (Math.floor(12) - Math.ceil(0)) + Math.ceil(0));
          const totalSpots = Math.floor(Math.random() * (Math.floor(50) - Math.ceil(12)) + Math.ceil(12));
          const cost =  Math.floor(Math.random() * (Math.floor(9) - Math.ceil(4)) + Math.ceil(4));
          var sizeOfSpot = ""
          var evAvilable = false
          var parkingCondition = ""
          if(cost % 2 == 0) evAvilable = true;
          else evAvilable = false

          if(totalSpots % 3 == 0){
            parkingCondition = "Indoor"
          } else if( totalSpots % 3 == 1){
            parkingCondition = "Outdoor"
          } else{
            parkingCondition = "Underground"
          }
          
          if(spotsAvailable % 3 == 0){
            sizeOfSpot = "Small"
          } else if( spotsAvailable % 3 == 1){
            sizeOfSpot = "Medium"
          } else{
            sizeOfSpot = "Large"
          }
          const parkingSpot = {name : results[i].name,
             latlng: [results[i].geometry.location.lat(), results[i].geometry.location.lng()],
              spotsAvailable : spotsAvailable,
              totalSpots : totalSpots,
              cost : cost,
              sizeOfSpot : sizeOfSpot,
              isBikeRack : false,
              evAvilable : evAvilable,
              parkingCondition : parkingCondition}
          this.storeParkingInfo(parkingSpot)
        }
      }
    });


  }

  storeParkingInfo(parkingSpot : any): void {
    this.parkingService.storeParkingInfo(parkingSpot)
  }
}
