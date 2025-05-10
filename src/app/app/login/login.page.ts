import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private toastCtrl: ToastController, private router: Router) {}

  async login() {
    try {
      const auth = getAuth();
      const firestore = getFirestore();

      // Inicia sesión
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      const uid = userCredential.user.uid;

      // Obtiene el documento del usuario
      const userDoc = await getDoc(doc(firestore, 'usuarios', uid));

      if (!userDoc.exists()) {
        throw new Error('No se encontró el perfil del usuario.');
      }

      const userData = userDoc.data();
      const rol = userData?.['rol'] || 'usuario';

      console.log('✅ Login exitoso. Rol:', rol);
      this.mostrarToast('Bienvenido ' + userData?.['nombre']);

      // Redirige según rol
      if (rol === 'admin') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/home');
      }

    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      this.mostrarToast('Error: ' + error.message);
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
}
