import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLinkWithHref],
})
export class LoginPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacionService);
  private readonly toastCtrl = inject(ToastController);

  formularioLogin!: FormGroup;

  ngOnInit(): void {
    this.construirFormulario();
  }

  private construirFormulario(): void {
    this.formularioLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get correo() {
    return this.formularioLogin.get('correo');
  }

  get contrasena() {
    return this.formularioLogin.get('contrasena');
  }

  async iniciarSesion() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    const { correo, contrasena } = this.formularioLogin.value;

    try {
      await this.authService.iniciarSesion(correo!, contrasena!);
      this.mostrarToast('Inicio de sesión exitoso');
    } catch (error: any) {
      this.mostrarToast('Error: ' + error.message);
    }
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
}
