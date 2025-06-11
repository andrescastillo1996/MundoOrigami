import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Origami } from '@core/models/origami';
import { COLECCIONES } from '@core/constantes/constantes';
import { LoaderService } from '@core/loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class OrigamiFirestoreAdapter {
  private readonly firestore = inject(Firestore);
  private readonly loading = inject(LoaderService); // Aunque LoaderService se podría manejar a nivel de servicio de negocio para un control más fino, lo mantendré aquí si esa es tu convención.
  private readonly origamisCollectionRef = collection(
    this.firestore,
    COLECCIONES.ORIGAMIS
  );

  /**
   * Obtiene todos los documentos de Origami.
   */
  async getAllOrigamis(): Promise<Origami[]> {
    return this.loading.showWhileLoading(
      firstValueFrom(
        collectionData(this.origamisCollectionRef, { idField: 'codigo' }) as any // Usamos 'codigo' como idField
      ) as Promise<Origami[]>,
      'Cargando origamis...'
    );
  }

  /**
   * Añade un nuevo documento Origami.
   * @param origamiData Datos del origami para añadir.
   * @returns El ID del documento recién creado.
   */
  async addOrigami(origamiData: Omit<Origami, 'codigo'>): Promise<string> {
    const docRef = await addDoc(this.origamisCollectionRef, origamiData);
    return docRef.id;
  }

  /**
   * Actualiza un documento Origami existente.
   * @param codigo El código (ID) del origami a actualizar.
   * @param origamiData Los datos parciales o completos para actualizar.
   */
  async updateOrigami(codigo: string, origamiData: Partial<Origami>): Promise<void> {
    const docRef = doc(this.firestore, COLECCIONES.ORIGAMIS, codigo);
    await updateDoc(docRef, origamiData);
  }

  /**
   * Elimina un documento Origami por su código.
   * @param codigo El código (ID) del origami a eliminar.
   */
  async deleteOrigami(codigo: string): Promise<void> {
    const docRef = doc(this.firestore, COLECCIONES.ORIGAMIS, codigo);
    await deleteDoc(docRef);
  }
}