// src/app/core/autenticacion/firebase-autenticacion-service-adapter.service.ts
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { COLECCIONES } from '@core/constantes/constantes';
import { Usuario } from '@core/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAutenticacionServiceAdapterService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  /**
   * Encapsula la llamada a signInWithEmailAndPassword de Firebase Auth.
   * @param correo El correo electrónico del usuario.
   * @param contrasena La contraseña del usuario.
   * @returns Una promesa que resuelve con las credenciales del usuario.
   */
  async firebaseSignInWithEmailAndPassword(
    correo: string,
    contrasena: string
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, correo, contrasena);
  }

  /**
   * Encapsula la llamada a getDoc de Firebase Firestore para obtener el documento de un usuario.
   * @param uid El UID del usuario.
   * @returns Una promesa que resuelve con el snapshot del documento del usuario.
   */
  async firebaseGetUserDocument(
    uid: string
  ): Promise<DocumentSnapshot<Usuario>> {
    return getDoc(doc(this.firestore, COLECCIONES.USUARIOS, uid)) as Promise<
      DocumentSnapshot<Usuario>
    >;
  }

  /**
   * Encapsula la llamada a signOut de Firebase Auth.
   * @returns Una promesa que resuelve cuando la sesión se ha cerrado.
   */
  async firebaseSignOut(): Promise<void> {
    return signOut(this.auth);
  }
}
