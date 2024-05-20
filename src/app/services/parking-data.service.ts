import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from, forkJoin, BehaviorSubject } from 'rxjs';
import { map, mergeMap, toArray, tap } from 'rxjs/operators';
import { ParkingSpot } from '../interfaces/parkingSpot';
import { UserService } from './user.service';
import { switchMap, filter } from 'rxjs/operators';
import { Reservation } from '../interfaces/reservation';
import { UserReservation } from '../interfaces/userReservation';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class ParkingDataService {
  private reservationSubject = new BehaviorSubject<Reservation[] | null>(null);
  public reservations$ = this.reservationSubject.asObservable();
  constructor(private firestore : AngularFirestore, private userService : UserService) { }

  storeParkingInfo(parkingSpot: any): void {
    this.firestore.collection('parkingSpots').add(parkingSpot)
    .then(docRef => console.log("Document written with ID: ", docRef.id))
    .catch(error => console.error("Error adding document: ", error));
  }

  getParkingSpots(): Observable<ParkingSpot[]> {
    return this.firestore.collection('parkingSpots').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ParkingSpot;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getParkingSpotById(spotId: string) {
    return this.firestore.collection('parkingSpots').doc<ParkingSpot>(spotId).valueChanges();
  }

  incrementParkingSpotAvailability(spotId : string, newSpotsAvailable : number){
    return this.firestore.collection('parkingSpots').doc(spotId).update({
      spotsAvailable: newSpotsAvailable
    });
  }

  updateParkingSpotAvailability(spotId: string, newSpotsAvailable: number, time : string): Promise<void> {
    this.userService.userInfo.subscribe(data => {
      if(!data) return
      const date = this.getCurrentDate()
      this.firestore.collection('reservedSlots').add({userID : data.id, spotID: spotId, date: date, time: time})
      .then(docRef => console.log("Document written with ID: ", docRef.id))
      .catch(error => console.error("Error adding document: ", error));
    })

    return this.firestore.collection('parkingSpots').doc(spotId).update({
      spotsAvailable: newSpotsAvailable
    });
  }

  fetchAndStoreReservations(userId: string): void {
    console.log("Fetching reservations for user ID:", userId); // Debug: Check user ID
  
    this.firestore.collection<Reservation>('reservedSlots', ref => ref.where('userID', '==', userId))
      .snapshotChanges()
      .pipe(
        tap(actions => console.log("Snapshot actions:", actions)), // Debug: Log actions
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Reservation;
          const id = a.payload.doc.id;
          return { id, ...data };
        })),
        tap(reservations => {this.reservationSubject.next(reservations)}), // Debug: Check mapped reservations
        mergeMap(reservations => {
          if (reservations.length === 0) {
            console.log("No reservations found"); // Debug: Inform no reservations
            return from([]);
          }
          return from(reservations).pipe(
            mergeMap(reservation =>
              this.firestore.collection('parkingSpots').doc<ParkingSpot>(reservation.spotID).valueChanges().pipe(
                map(spot => {
                  if (!spot) {
                    console.error("Parking spot not found for ID:", reservation.spotID); // Error handling if spot is null
                  }
                  return { ...reservation, parkingSpot: spot };
                })
              )
            ),
            toArray(),
            tap(completeReservations => console.log("Complete reservations with spots:", completeReservations)) // Debug: Final output
          );
        }),
        tap(reservations => this.reservationSubject.next(reservations))
      )
      .subscribe({
        error: err => console.error('Error fetching reservations:', err),
        complete: () => console.log('Reservation fetching completed.')
      });
  }

  deleteReservation(reservationId: string): Promise<void> {
    return this.firestore.collection('reservedSlots').doc(reservationId).delete()
      .then(() => console.log(`Successfully deleted reservation with ID: ${reservationId}`))
      .catch(error => console.error(`Error deleting reservation: ${error}`));
  }

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-based.
    const day = now.getDate();
  
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

}
