import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, firstValueFrom } from 'rxjs';
import { Tutorial } from './modelos/tutorial';
import { TutorialService } from './servicios/tutorial.service';
import { HistorialUsuarioService } from '../../../shared/historial-usuario/service/historial-usuario.service'; // ✅ Asegúrate que esté bien importado
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],

  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class TutorialPage implements OnInit {
  tutorial = signal<Tutorial | undefined>(undefined);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tutorialService = inject(TutorialService);
  private historialService = inject(HistorialUsuarioService);
  private toastCtrl = inject(ToastController);

ngOnInit() {
  const codigo = this.route.snapshot.paramMap.get('codigo')!;
  this.tutorialService.getTutorialPorCodigo(codigo).then(data => {
    this.tutorial.set(data);
  });
}


  async comenzarTutorial(codigo: string) {
    try {
      const historial = await firstValueFrom(
        this.historialService.getHistorialPorTutorial(codigo)
      );

      if (!historial || historial.estadoProceso === 'sin-empezar') {
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
