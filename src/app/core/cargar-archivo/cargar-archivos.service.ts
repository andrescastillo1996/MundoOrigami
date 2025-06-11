// src/app/services/cargar-archivos.service.ts
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { FirebaseStorageAdapterService } from '../adapters/firebase-storage-adapter.service'; // Importa el nuevo adaptador

@Injectable({
  providedIn: 'root',
})
export class CargarArchivosService {
  // Ahora inyectamos el adaptador en lugar de Storage directamente
  constructor(private firebaseStorageAdapter: FirebaseStorageAdapterService) {}

  uploadImage(path: string, file: File): Observable<string> {
    console.log('Subiendo imagen:', file.name, 'a la ruta:', path);
    const filePath = `${path}/${Date.now()}_${file.name}`;
    console.log('Ruta del archivo:', filePath);

    // Usamos el adaptador para crear la referencia y realizar las operaciones
    const storageRef = this.firebaseStorageAdapter.createRef(filePath);
    console.log('Referencia de almacenamiento:', storageRef);

    return this.firebaseStorageAdapter
      .uploadBytes(storageRef, file)
      .pipe(
        switchMap(() => this.firebaseStorageAdapter.getDownloadURL(storageRef))
      );
  }
}
