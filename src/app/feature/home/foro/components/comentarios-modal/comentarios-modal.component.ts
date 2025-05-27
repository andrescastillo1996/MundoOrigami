import { Comentario } from './../../modelos/comentario.model';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ForoService } from '../../servicios/foro.service';

@Component({
  selector: 'app-comentarios-modal',
  templateUrl: './comentarios-modal.component.html',
  styleUrls: ['./comentarios-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ComentariosModalComponent implements OnInit {
  @Input() publicacionId!: string;
  foroService = inject(ForoService);
  modalCtrl = inject(ModalController);
  fb = inject(FormBuilder);

  comentarios = signal<Comentario[]>([]); // Usar signal para reactividad

  form!: FormGroup;

  constructor() {}

  ngOnInit() {
    this.construirFormulario();
    this.cargarComentarios();
  }

  private cargarComentarios() {
    this.foroService
      .getPublicacionPorId(this.publicacionId)
      .subscribe(comentarios => {
        if (comentarios.comentarios) {
          this.comentarios.set(comentarios.comentarios);
        }
      });
  }

  private construirFormulario() {
    this.form = this.fb.group({
      texto: ['', Validators.required],
    });
  }

  async agregarComentario() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.foroService.agregarComentario(this.publicacionId, {
      texto: this.form.value.texto,
      publicacionId: this.publicacionId,
      id: '',
      fecha: new Date(),
    });

    this.form.reset();
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
