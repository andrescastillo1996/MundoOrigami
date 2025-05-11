import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterLinkWithHref } from '@angular/router';
import { RegistroService } from '@core/autenticacion/registro.service';
import { CommonModule } from '@angular/common';
import { RUTAS } from '@shared/constantes/constantes';
import { MENSAJES_EXITO } from '@shared/constantes/mensajes';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLinkWithHref],
})
export class RegistroPage implements OnInit {
  registroForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);
  private readonly authService = inject(RegistroService);

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue],
    });
  }

  get nombre() {
    return this.registroForm.get('nombre');
  }
  get email() {
    return this.registroForm.get('correo');
  }
  get password() {
    return this.registroForm.get('contrasena');
  }
  get confirmPassword() {
    return this.registroForm.get('confirmarContrasena');
  }
  get passwordsNoMatch(): boolean {
    return (
      this.registroForm.get('contrasena')?.value !==
      this.registroForm.get('confirmarContrasena')?.value
    );
  }

  async onSubmit() {
    if (this.registroForm.valid && !this.passwordsNoMatch) {
      const { nombre, correo, contrasena } = this.registroForm.value;
      try {
        await this.authService.registrarUsuario(correo, contrasena, nombre);
        this.mostrarToast(MENSAJES_EXITO.USUARIO_CREADO);
        this.router.navigateByUrl(RUTAS.LOGIN);
      } catch (error: any) {
        this.mostrarToast('Error: ' + error.message);
      }
    }
  }

  volverAlLogin() {
    this.router.navigate([RUTAS.LOGIN]);
  }

  async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'primary',
    });
    await toast.present();
  }
}
