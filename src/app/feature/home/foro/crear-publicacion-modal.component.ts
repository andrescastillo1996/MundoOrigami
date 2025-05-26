// src/app/feature/foro/crear-publicacion-modal/crear-publicacion-modal.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from './servicios/publicaciones.service';
import { SesionService } from '@core/autenticacion/sesion.service';
import { LoaderService } from '@core/loader/loader.service';
import { Usuario } from '@core/models/usuario.model'; // Asegúrate de tener esta importación

@Component({
  selector: 'app-crear-publicacion-modal',
  templateUrl: './crear-publicacion-modal.component.html',
  styleUrls: ['./crear-publicacion-modal.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CrearPublicacionModalComponent {
  private readonly publicacionesService: PublicacionesService = inject(PublicacionesService);
  private readonly modalController: ModalController = inject(ModalController);
  private readonly sesionService: SesionService = inject(SesionService);
  private readonly loadingService: LoaderService = inject(LoaderService);

  titulo: string = '';
  contenido: string = '';

  async crearPublicacion(): Promise<void> {
    const usuarioRaw = this.sesionService.obtener();
    if (!usuarioRaw || !usuarioRaw.uid) {
      console.error('Usuario no autenticado o UID no disponible.');
      return;
    }


    const usuario: Usuario = usuarioRaw;

    if (!this.titulo.trim() || !this.contenido.trim()) {
      alert('Por favor, ingresa un título y contenido para tu publicación.');
      return;
    }

    await this.loadingService.showWhileLoading(
      (async () => {
        const nuevaPublicacion = {
          titulo: this.titulo.trim(),
          contenido: this.contenido.trim(),
          usuarioNombre: usuario.nombre || usuario.correo,
          usuarioId: usuario.uid,
        };
        await this.publicacionesService.crearPublicacion(nuevaPublicacion);
        this.modalController.dismiss(true, 'confirm');
      })(),
      'Creando publicación...'
    );
  }

  cancelar(): void {
    this.modalController.dismiss(null, 'cancel');
  }
}

