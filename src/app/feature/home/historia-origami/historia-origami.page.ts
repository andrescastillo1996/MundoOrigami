import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { HistoriaOrigami } from '../../../core/models/historia-origami';
import { HistoriaOrigamiService } from './servicios/historia-origami.service';

@Component({
  selector: 'app-historia-origami',
  templateUrl: './historia-origami.page.html',
  styleUrls: ['./historia-origami.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HistoriaOrigamiPage implements OnInit {
  private historiaService = inject(HistoriaOrigamiService);

  ejemplos_practicos = signal<HistoriaOrigami[]>([]);

  ngOnInit(): void {
    this.obtenerEjemplosPracticos();
  }

  private obtenerEjemplosPracticos(): void {
    this.historiaService
      .getEjemplosPracticos()
      .then(data => {
        this.ejemplos_practicos.set(data);
      });
  }
}
