import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ForoService } from '../../servicios/foro.service';
import { CommonModule } from '@angular/common';
import { CargarArchivosService } from '@core/cargar-archivo/cargar-archivos.service';

@Component({
  selector: 'app-crear-publicacion-modal',
  templateUrl: './crear-publicacion-modal.component.html',
  styleUrls: ['./crear-publicacion-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class CrearPublicacionModalComponent implements OnInit {
  form!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly foroService = inject(ForoService);
  private readonly modalCtrl = inject(ModalController);

  private readonly cargarArchivoService = inject(CargarArchivosService);

  ngOnInit(): void {
    this.construirFormulario();
  }

  private construirFormulario() {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      url: [''],
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.cargarArchivoService
      .uploadImage('publicacion', file)
      .subscribe(url => {
        this.form.get('url')?.setValue(url);
      });
  }

  eliminarImagen(): void {
    this.form.get('url')?.setValue(null);
  }

  async crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { titulo, descripcion, url } = this.form.value;
    await this.foroService.crearPublicacion({
      titulo,
      descripcion,
      url: url,
      id: '',
      fechaCreacion: new Date(),
      likes: [],
      dislikes: [],
    });

    this.modalCtrl.dismiss();
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }
}
