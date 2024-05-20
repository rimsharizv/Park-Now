import { ParkingSpot } from "./parkingSpot";

export interface UserReservation{
    id? : string;
    spotID : string;
    parkingSpot : ParkingSpot;
    date : string;
    time : string;
}