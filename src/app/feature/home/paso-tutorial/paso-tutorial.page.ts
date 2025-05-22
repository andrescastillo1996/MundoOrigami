import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasoTutorialService } from './servicios/paso-tutorial.service';
import { PasoTutorial } from './modelos/paso-tutorial';
import { HistorialUsuarioService } from '../shared/historial/historial-usuario.service';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-paso-tutorial',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './paso-tutorial.page.html',
  styleUrls: ['./paso-tutorial.page.scss'],
})
export class PasoTutorialPage implements OnInit {
  pasos = signal<PasoTutorial[]>([]);
  pasoActualIndex = signal(0);
  tutorialCodigo = 0;

  pasoActual = computed(() => this.pasos()[this.pasoActualIndex()]);

  private pasoService = inject(PasoTutorialService);
  private historialService = inject(HistorialUsuarioService);
  private toastController = inject(ToastController);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.tutorialCodigo = Number(this.route.snapshot.paramMap.get('codigo'));
    this.pasoService
      .getPasosPorCodigoTutorial(this.tutorialCodigo)
      .subscribe(data => {
        const ordenados = data.sort((a, b) => a.orden - b.orden);
        this.pasos.set(ordenados);
      });
  }

  pasoAnterior() {
    if (this.pasoActualIndex() > 0) {
      this.pasoActualIndex.update(i => i - 1);
    }
  }

  siguientePaso() {
    const esUltimoPaso = this.pasoActualIndex() === this.pasos().length - 1;

    if (esUltimoPaso) {
      this.finalizarTutorial();
    } else {
      this.pasoActualIndex.update(i => i + 1);
    }
  }

  async finalizarTutorial() {
    try {
      await this.historialService.finalizarTutorial(this.tutorialCodigo);
      this.mostrarToast('¡Tutorial finalizado!');
      this.router.navigate(['/home/origami']); // Redirige a la galería
    } catch (error) {
      console.error('Error al finalizar el tutorial:', error);
      this.mostrarToast('Error al finalizar el tutorial');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }
}
