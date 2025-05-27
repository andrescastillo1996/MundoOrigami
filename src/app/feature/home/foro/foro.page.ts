import {
  Component,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { PublicacionCardComponent } from './components/publicacion-card/publicacion-card.component';
import { Publicacion } from './modelos/publicacion.model';
import { ForoService } from './servicios/foro.service';
import { CrearPublicacionModalComponent } from './components/crear-publicacion-modal/crear-publicacion-modal.component';

@Component({
  selector: 'app-foro',
  templateUrl: './foro.page.html',
  styleUrls: ['./foro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PublicacionCardComponent],
})
export class ForoPage implements OnInit {
  publicaciones: WritableSignal<Publicacion[]> = signal([]);
  private readonly foroService = inject(ForoService);
  private readonly modalCtrl = inject(ModalController);

  ngOnInit() {
    this.foroService.getPublicaciones().subscribe(data => {
      console.log('Publicaciones obtenidas:', data);
      this.publicaciones.set(data);
    });
  }

  async abrirCrearPublicacion() {
    const modal = await this.modalCtrl.create({
      component: CrearPublicacionModalComponent,
    });
    await modal.present();
  }
}
