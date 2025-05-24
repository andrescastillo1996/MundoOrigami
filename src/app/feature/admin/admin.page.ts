import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminPage {
  private firestore = inject(Firestore);
  private router = inject(Router);

  items = [
    { nombre: 'Agregar Origami', ruta: '/home/agregar-origami' },
    { nombre: 'Agregar Tutorial', ruta: '/home/agregar-tutorial' },
    { nombre: 'Modificar Origami', ruta: '/home/modificar-origami' },
    { nombre: 'Modificar Tutorial', ruta: '/home/modificar-tutorial' },
  ];

  esAdmin = false;

  constructor() {
    this.verificarRolDeUsuario();
  }

  verificarRolDeUsuario() {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if (user) {
        const docRef = doc(this.firestore, `usuarios/${user.uid}`);
        docData(docRef).subscribe((datos: any) => {
          this.esAdmin =
            Array.isArray(datos?.rol) && datos.rol.includes('administrador');
        });
      }
    });
  }

  navegar(item: any) {
    this.router.navigate([item.ruta]);
  }
}
