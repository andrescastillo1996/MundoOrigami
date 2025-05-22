import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, IonicModule],
})
export class AdminPage {
  seleccion = '';
  opciones = [
    { valor: 'usuarios', label: 'Usuarios' },
    { valor: 'productos', label: 'Productos' },
  ];

  items = [{ nombre: 'Item 1' }, { nombre: 'Item 2' }, { nombre: 'Item 3' }];

  agregar() {
    console.log('Agregar nuevo ítem');
  }

  editarItem(item: any) {
    console.log('Editar', item);
  }

  eliminarItem(item: any) {
    console.log('Eliminar', item);
  }
}
