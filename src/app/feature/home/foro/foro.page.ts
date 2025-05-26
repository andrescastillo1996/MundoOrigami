import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular'; // Importar ModalController
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { Publicacion } from './modelos/publicacion';
import { PublicacionesService } from './servicios/publicaciones.service';
import { SesionService } from '../../../core/autenticacion/sesion.service'; // Para obtener información del usuario actual
import { CrearPublicacionModalComponent } from './crear-publicacion-modal.component';

@Component({
  selector: 'app-foro',
  templateUrl: './foro.page.html',
  styleUrls: ['./foro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ForoPage implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private destroyRef = inject(DestroyRef);
  private sesionService = inject(SesionService); // Inyectar SesionService
  private modalController = inject(ModalController); // Inyectar ModalController

  publicaciones = signal<Publicacion[]>([]);
  usuarioActual = this.sesionService.obtener(); // Obtener usuario actual

  ngOnInit(): void {
    this.obtenerPublicaciones();
  }

  private obtenerPublicaciones(): void {
    this.publicacionesService
      .getPublicaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.publicaciones.set(data);
      });
  }

  async abrirModalCrearPublicacion(): Promise<void> {
    const modal = await this.modalController.create({
      component: CrearPublicacionModalComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      // Refrescar publicaciones después de crear una nueva
      this.obtenerPublicaciones();
    }
  }

  // Opcional: Añadir métodos para editar/eliminar publicaciones si es necesario
  // Necesitarás verificar si el usuario actual es el autor o un administrador
  async eliminarPublicacion(id: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await this.publicacionesService.eliminarPublicacion(id);
        this.obtenerPublicaciones(); // Refrescar la lista
      } catch (error) {
        console.error('Error al eliminar publicación:', error);
        // Manejar error (ej. mostrar un mensaje de brindis)
      }
    }
  }
}
