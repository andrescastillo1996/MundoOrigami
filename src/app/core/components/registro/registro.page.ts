import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegistroPage {
  email = '';
  password = '';
  confirmPassword = '';
  nombre = '';
  termsAccepted = false;

  constructor(
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async registrar() {
    try {
      const auth = getAuth();
      const firestore = getFirestore();

      // Crea el usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        this.email,
        this.password
      );
      const uid = userCredential.user.uid;

      // Guarda los datos adicionales en Firestore
      await setDoc(doc(firestore, 'usuarios', uid), {
        uid,
        nombre: this.nombre,
        email: this.email,
        rol: 'usuario', // puedes cambiar a 'admin' según el caso
        creadoEn: new Date(),
      });

      console.log('✅ Usuario registrado y almacenado');
      this.mostrarToast('Usuario registrado con éxito');
      this.router.navigateByUrl('/login');
    } catch (error: any) {
      console.error('❌ Error al registrar:', error);
      this.mostrarToast('Error: ' + error.message);
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'primary',
    });
    await toast.present();
  }
}
