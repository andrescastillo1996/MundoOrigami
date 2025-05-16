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
    // Navegación o modal de creación
  }

  editarItem(item: any) {
    console.log('Editar', item);
    // Podrías reutilizar el modal, pasándole el ítem como input
  }

  eliminarItem(item: any) {
    console.log('Eliminar', item);
    // Lógica para eliminar el ítem del arreglo o base de datos
  }
}
