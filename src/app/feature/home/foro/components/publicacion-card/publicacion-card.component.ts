import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
} from '@angular/core';
import { Publicacion } from '../../modelos/publicacion.model';
import { ForoService } from '../../servicios/foro.service';
import { IonicModule, ModalController } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { ComentariosModalComponent } from '../comentarios-modal/comentarios-modal.component';

@Component({
  selector: 'app-publicacion-card',
  templateUrl: './publicacion-card.component.html',
  styleUrls: ['./publicacion-card.component.scss'],
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
})
export class PublicacionCardComponent {
  @Input({ required: true }) publicacion!: Publicacion;

  foroService = inject(ForoService);
  modalCtrl = inject(ModalController);

  toggleMegusta(): void {
    this.foroService.toggleReaccion(this.publicacion.id, 'meGusta');
  }

  toggleNoMegusta() {
    this.foroService.toggleReaccion(this.publicacion.id, 'noMeGusta');
  }

  async abrirComentarios() {
    const modal = await this.modalCtrl.create({
      component: ComentariosModalComponent,
      componentProps: { publicacionId: this.publicacion.id },
    });
    await modal.present();
  }
}
