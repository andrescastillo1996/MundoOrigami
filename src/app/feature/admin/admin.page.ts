import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminPage {
  private readonly auth = inject(AutenticacionService);
  click() {
    this.auth.cerrarSesion();
  }
}
