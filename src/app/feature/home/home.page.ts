import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  AlertController
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonLabel,
    IonIcon,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ],
})
export class HomePage {
  constructor(
    private router: Router,
    private auth: Auth,
    private alertController: AlertController
  ) {}

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

 async logout() {
  const alert = await this.alertController.create({
    header: 'Confirmar',
    message: '¿Estás seguro que deseas cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Cerrar sesión',
        handler: async () => {
          try {
            await signOut(this.auth);
            localStorage.removeItem('usuario'); // ✅ Eliminar del almacenamiento local
            this.router.navigate(['/login'], { replaceUrl: true });
          } catch (error) {
            console.error('Error cerrando sesión:', error);
          }
        }
      }
    ]
  });

    await alert.present();
  }
}
