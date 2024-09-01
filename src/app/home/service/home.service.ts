import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, refEqual } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  //private readonly storage: Storage = inject(Storage)
  private readonly firestore: Firestore = inject(Firestore)

  constructor() { }

  ORIGAMI_COLLECTION = collection(this.firestore,'mundoOrigami');


  getAll(){
    return collectionData(this.ORIGAMI_COLLECTION,{idField:'id'}) as Observable<any[]>
  }
}
