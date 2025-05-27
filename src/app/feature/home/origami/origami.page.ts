import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

import { Origami } from '@core/models/origami';
import { OrigamiService } from './servicios/origami.service';
import { HistorialUsuarioService } from '@shared/historial-usuario/service/historial-usuario.service';
import { ColorEstadoPipe } from './pipes/color-estado.pipe';
import { TextoEstadoPipe } from './pipes/texto-estado.pipe';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-origami',
  templateUrl: './origami.page.html',
  styleUrls: ['./origami.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    ColorEstadoPipe,
    TextoEstadoPipe,
    FormsModule,
  ],
  providers: [OrigamiService],
})
export class OrigamiPage implements OnInit {
  private origamiService = inject(OrigamiService);

  private historialService = inject(HistorialUsuarioService);

  private toastCtrl = inject(ToastController);

  private router = inject(Router);

  origamis = signal<Origami[]>([]);

  filtroEstado = signal<
    'todos' | 'sin-empezar' | 'en-ejecucion' | 'finalizado'
  >('todos');

  origamisFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const origamis = this.origamis();

    if (estado === 'todos') return origamis;
    return origamis.filter(
      o => o.estadoProceso?.toLocaleLowerCase() === estado.toLocaleLowerCase()
    );
  });

  ngOnInit(): void {
    this.obtenerOrigamisConEstado();
  }

  private obtenerOrigamisConEstado(): void {
    this.origamiService.getOrigamis().then(origamis => {
      this.historialService.getHistorialDelUsuario().then(historial => {
        const actualizados = origamis.map(origami => {
          const h = historial.find(h => h.tutorialCodigo === origami.codigo);
          return {
            ...origami,
            estadoProceso: h?.estadoProceso ?? ESTADOS_TUTORIAL.SIN_EMPEZAR,
          };
        });
        this.origamis.set(actualizados);
      });
    });
  }

  public irATutorialDeOrigami(
    codigo: string,
    estado: string | undefined
  ): void {
    if (estado === ESTADOS_TUTORIAL.SIN_EMPEZAR) {
      this.historialService.iniciarTutorial(codigo);
    }
    this.comenzarTutorial(codigo);
  }

  private async comenzarTutorial(codigo: string) {
    try {
      const historial = await firstValueFrom(
        this.historialService.getHistorialPorTutorial(codigo)
      );

      if (
        !historial ||
        historial.estadoProceso === ESTADOS_TUTORIAL.SIN_EMPEZAR
      ) {
        await this.historialService.iniciarTutorial(codigo);
        this.mostrarToast('¡Tutorial iniciado!');
      }

      this.router.navigate(['/home/paso-tutorial', codigo]);
    } catch (error) {
      console.error('Error al comenzar tutorial:', error);
      this.mostrarToast('Error al iniciar el tutorial');
    }
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }
}
