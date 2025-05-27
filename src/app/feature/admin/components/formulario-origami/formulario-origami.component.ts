import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrigamiEdicion } from '@feature/admin/models/origami-edicion';
import { CargarArchivosService } from '@feature/admin/services/cargar-archivos.service';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-formulario-origami',
  templateUrl: './formulario-origami.component.html',
  styleUrls: ['./formulario-origami.component.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  standalone: true,
})
export class FormularioOrigamiComponent implements OnInit {
  @Input() data?: OrigamiEdicion;

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private uploadService = inject(CargarArchivosService);

  form!: FormGroup;

  ngOnInit(): void {
     console.log('Datos recibidos:', this.data);
    this.construirFormulario();
    if (this.data) {
      this.cargarDatosParaEdicion(this.data);
    }
  }

  cargarDatosParaEdicion(data: OrigamiEdicion) {
    this.form.patchValue({
      ...data.origami,
    });

    const pasosArray = this.form.get('pasos') as FormArray;
    data.pasos.forEach(paso => {
      pasosArray.push(
        this.fb.group({
          orden: [paso.orden],
          descripcion: [paso.descripcion],
          imagen: [paso.imagen], 
        })
      );
    });
    console.log('Formulario cargado para edición:', this.form.value);
  }

  private construirFormulario() {
    this.form = this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      tipoOrigami: ['tradicional', Validators.required],
      tipoRecurso: ['imagen', Validators.required],
      url: ['', Validators.required], // luego se sustituye por la URL de Firebase
      pasos: this.fb.array([]),
    });
  }

  get pasos(): FormArray {
    return this.form.get('pasos') as FormArray;
  }

  agregarPaso() {
    this.pasos.push(
      this.fb.group({
        orden: [this.pasos.length + 1, Validators.required],
        descripcion: ['', Validators.required],
        imagen: ['', Validators.required], // luego se sustituye por la URL
        tutorialCodigo: [this.form.get('codigo')?.value],
      })
    );
  }

  onFileSelected(event: any, tipo: 'origami' | 'paso', index?: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    const path = tipo === 'origami' ? 'origamis' : 'pasos';

    this.uploadService.uploadImage(path, file).subscribe(url => {
      if (tipo === 'origami') {
        this.form.get('url')?.setValue(url);
      } else if (typeof index === 'number') {
        const paso = this.form.get('pasos')?.get(`${index}`);
        paso?.get('imagen')?.setValue(url);
      }
    });
  }

  eliminarPaso(index: number) {
    this.pasos.removeAt(index);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  guardar() {
    console.log('Formulario enviado:', this.form.invalid);
    if (this.form.invalid) return;
    this.modalCtrl.dismiss(this.form.value);
  }

  eliminarImagen(tipo: 'origami' | 'paso', index?: number) {
    if (tipo === 'origami') {
      this.form.get('url')?.setValue(null);
    } else if (tipo === 'paso' && index !== undefined) {
      const pasosArray = this.form.get('pasos') as FormArray;
      pasosArray.at(index).get('url')?.setValue(null);
    }
  }
}
