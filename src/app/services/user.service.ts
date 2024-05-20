import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserInformation } from '../interfaces/user';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoSubject = new BehaviorSubject<UserInformation | null>(null);
  public userInfo = this.userInfoSubject.asObservable();

  constructor(private firestore : AngularFirestore) { }

  storeUserInfo(user: UserInformation): void {
    this.firestore.collection('userInformation').add(user)
    .then(docRef => console.log("Document written with ID: ", docRef.id))
    .catch(error => console.error("Error adding document: ", error));
  }

  getUserByEmail(email: string): Observable<UserInformation[]> {
    return this.firestore.collection<UserInformation>('userInformation', ref => 
      ref.where('email', '==', email)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as UserInformation;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  setUserInfo(user : UserInformation) {
    this.userInfoSubject.next(user);
  }

  getUserInfo(){
    return this.userInfo;
  }

  logout(){
    this.userInfoSubject.next(null);
  }
}
