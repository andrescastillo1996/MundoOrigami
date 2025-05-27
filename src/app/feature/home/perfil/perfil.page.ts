import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';

import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

  ],
})
export class PerfilPage {
  private fb = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      claveActual: ['', Validators.required],
      nuevaClave: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async cambiarClave() {
    const { claveActual, nuevaClave } = this.form.value;
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, claveActual);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, nuevaClave);
      alert('Contraseña actualizada correctamente.');
      this.form.reset();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo cambiar la contraseña.'));
    }
  }
}
