// src/app/core/adapters/paso-tutorial-firestore-adapter.service.ts
import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import { PasoTutorial } from '@core/models/paso-tutorial'; // Asegúrate de que esta ruta sea correcta
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root', // Asegúrate de que este adapter sea un singleton y esté disponible en toda la aplicación
})
export class PasoTutorialFirestoreAdapter {
  private firestore = inject(Firestore);

  constructor() {}

  /**
   * Obtiene los pasos de un tutorial desde Firestore basándose en su código.
   * @param tutorialCodigo El código del tutorial.
   * @returns Una promesa que resuelve con un array de PasoTutorial.
   */
  async getPasosPorCodigoTutorial(
    tutorialCodigo: string
  ): Promise<PasoTutorial[]> {
    const pasosRef = collection(this.firestore, 'pasos');
    const q = query(pasosRef, where('tutorialCodigo', '==', tutorialCodigo));

    // collectionData ya mapea los documentos a un tipo T, pero es buena práctica asegurarnos.
    const pasos = await firstValueFrom(collectionData(q));

    // Aquí puedes añadir lógica de mapeo adicional si los datos de Firestore
    // no coinciden exactamente con la interfaz PasoTutorial.
    // Por ejemplo, si un campo en Firestore se llama 'id' y en tu modelo es 'codigoPaso':
    // return pasos.map(p => ({ ...p, codigoPaso: p['id'] })) as PasoTutorial[];

    return pasos as PasoTutorial[];
  }
}
