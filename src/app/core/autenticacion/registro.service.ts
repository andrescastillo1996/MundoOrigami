import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  async registrarUsuario(email: string, password: string, nombre: string) {
    console.log('Registro de usuario:', email, password, nombre);
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      uid: cred.user.uid,
      nombre,
      email,
      rol: ['usuario'],
      fechaCreacion: new Date().toString(),
    });
  }
}
