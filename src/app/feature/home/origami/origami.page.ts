import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Origami } from './modelo/origami';
import { OrigamiService } from './servicios/origami.service';
import { HistorialUsuarioService } from '../historial/historial.service';

@Component({
  selector: 'app-origami',
  templateUrl: './origami.page.html',
  styleUrls: ['./origami.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  providers: [OrigamiService],
})
export class OrigamiPage implements OnInit {
  private origamiService = inject(OrigamiService);
  private historialService = inject(HistorialUsuarioService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  origamis = signal<Origami[]>([]);

  ngOnInit(): void {
    this.obtenerOrigamisConEstado();
  }

  private obtenerOrigamisConEstado(): void {
    this.origamiService.getOrigamis()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(origamis => {
        this.historialService.getHistorialDelUsuario()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(historial => {
            const actualizados = origamis.map(origami => {
              const h = historial.find(h => h.tutorialCodigo === origami.codigo);
              return {
                ...origami,
                estadoProceso: h?.estadoProceso ?? 'sin-empezar'
              };
            });
            this.origamis.set(actualizados);
          });
      });
  }

  irATutorialDeOrigami(codigo: number, estado: string | undefined): void {
    const normalizado = (estado || '').toLowerCase().replace(/[\s\-]/g, '');
    if (normalizado === 'sinempezar') {
      this.historialService.iniciarTutorial(codigo);
    }
    this.router.navigate(['/home/tutorial', codigo]);
  }

  getColorEstado(estado: string | undefined): string {
    const normalizado = (estado || '').toLowerCase().replace(/[\s\-]/g, '');
    switch (normalizado) {
      case 'sinempezar':
        return 'medium';
      case 'enejecucion':
        return 'warning';
      case 'finalizado':
        return 'success';
      default:
        return 'medium';
    }
  }

  getTextoEstado(estado: string | undefined): string {
    const normalizado = (estado || '').toLowerCase().replace(/[\s\- ]/g, '');
    switch (normalizado) {
      case 'sinempezar':
        return 'Sin empezar';
      case 'enejecucion':
        return 'En ejecución';
      case 'finalizado':
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  }
}
