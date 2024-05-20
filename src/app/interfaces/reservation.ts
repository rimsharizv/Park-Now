import { ParkingSpot } from "./parkingSpot";

export interface Reservation{
    id? : string
    spotID : string;
    date : any;
    time : string;
    userID? : string
}