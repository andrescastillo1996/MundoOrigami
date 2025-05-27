import { Component, inject, OnInit } from '@angular/core';
import {
  IonicModule,
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormularioOrigamiComponent } from './components/formulario-origami/formulario-origami.component';
import { AdministrarOrigamiService } from './services/administrar-origami.service';
import { Origami } from '@core/models/origami';
import { OrigamiEdicion } from './models/origami-edicion';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, IonicModule],
})
export class AdminPage implements OnInit {
  public origamis: OrigamiEdicion[] = [];

  private readonly modalCtrl = inject(ModalController);
  private readonly toastController = inject(ToastController);

  private readonly administrarOrigiamiService = inject(
    AdministrarOrigamiService
  );
  private alertController = inject(AlertController);

  ngOnInit(): void {
    this.cargarOrigamis();
  }

  private async cargarOrigamis(): Promise<void> {
    this.origamis =
      await this.administrarOrigiamiService.obtenerOrigamisConPasos();
    console.log('Origamis con pasos:', this.origamis);
  }

  async agregar(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: FormularioOrigamiComponent,
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('Datos recibidos del modal:', data);

      const origami = this.construirOrigami(data);
      this.administrarOrigiamiService
        .agregarOrigamiConPasos(origami, data.pasos)
        .then(() => {
          this.mostrarToast('Origami y pasos guardados correctamente');
          this.cargarOrigamis();
        });
    }
  }

  private construirOrigami(form: any): Origami {
    return {
      codigo: form?.codigo,
      nombre: form?.nombre,
      descripcion: form?.descripcion,
      tipoOrigami: form?.tipoOrigami,
      estado: 'ACTIVO',
      tipoRecurso: form?.tipoRecurso,
      url: form?.url,
    };
  }

  async editarItem(item: OrigamiEdicion): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: FormularioOrigamiComponent,
      componentProps: {
        data: item,
      },
    });

    await modal.present();

    const { data: dataActualizada } = await modal.onWillDismiss();

    if (dataActualizada) {
      const origami = this.construirOrigami(dataActualizada);
      const pasos = dataActualizada.pasos;

      this.administrarOrigiamiService
        .actualizarOrigamiConPasos(origami, pasos)
        .then(() => {
          this.mostrarToast('Origami actualizado correctamente');

          this.cargarOrigamis();
        });
    }
  }

  async eliminarItem(item: OrigamiEdicion) {
    const alert = await this.alertController.create({
      header: '¿Eliminar?',
      message: `¿Deseas eliminar el origami "${item.origami.nombre}" y todos sus pasos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.administrarOrigiamiService.eliminarOrigamiConPasos(
              item.origami.codigo
            );
            this.origamis = this.origamis.filter(
              o => o.origami.codigo !== item.origami.codigo
            );

            this.mostrarToast('Origami eliminado correctamente');
          },
        },
      ],
    });

    await alert.present();
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }
}
