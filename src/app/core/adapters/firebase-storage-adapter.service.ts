// src/app/services/firebase-storage-adapter.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  UploadResult,
} from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageAdapterService {
  private storage = inject(Storage);

  createRef(path: string) {
    return ref(this.storage, path);
  }

  uploadBytes(storageRef: any, file: File): Observable<UploadResult> {
    return from(uploadBytes(storageRef, file));
  }

  getDownloadURL(storageRef: any): Observable<string> {
    return from(getDownloadURL(storageRef));
  }
}
