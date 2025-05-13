import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],
})
export class HomePage {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  navegarA(path: string): void {
    this.router.navigate(['/home', path]);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            try {
              this.autenticacionService.cerrarSesion();
            } catch (error) {
              console.error('Error cerrando sesión:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
