import { FirestoreDataConverter, Timestamp } from '@angular/fire/firestore';
import { Tutorial } from './modelos/tutorial';

export const tutorialConverter: FirestoreDataConverter<Tutorial> = {
  toFirestore(tutorial: Tutorial) {
    return tutorial;
  },

  fromFirestore(snapshot, options): Tutorial {
    const data = snapshot.data(options)!;
    return {
      codigo: data['codigo'],
      descripcion: data['descripcion'],
      totalPasos: data['totalPasos'],
      fechaCreacion: (data['fechaCreacion'] as Timestamp).toDate().toISOString(),
      fechaModificacion: (data['fechaModificacion'] as Timestamp).toDate().toISOString(),
      origami: data['origami'],
    };
  }
};

