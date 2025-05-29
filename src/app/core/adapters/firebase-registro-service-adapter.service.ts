import { inject, Injectable } from '@angular/core';
import { Auth, UserCredential, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseRegistroServiceAdapterService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  /**
   * Encapsula la llamada a createUserWithEmailAndPassword de Firebase Auth.
   * @param email El correo electrónico del nuevo usuario.
   * @param password La contraseña del nuevo usuario.
   * @returns Una promesa que resuelve con las credenciales del usuario creado.
   */
  async firebaseCreateUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Encapsula la llamada a setDoc de Firebase Firestore para guardar los datos del usuario.
   * @param uid El UID del usuario.
   * @param data Los datos del usuario a guardar.
   * @returns Una promesa que resuelve cuando el documento se ha guardado.
   */
  async firebaseSetUserDocument(uid: string, data: any): Promise<void> {
    return setDoc(doc(this.firestore, 'usuarios', uid), data);
  }
}