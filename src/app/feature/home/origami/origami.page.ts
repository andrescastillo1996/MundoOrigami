import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Origami } from './modelo/origami';
import { OrigamiService } from './servicios/origami.service';
import { HistorialUsuarioService } from '../shared/historial/historial-usuario.service';
import { ColorEstadoPipe } from './pipes/color-estado.pipe';
import { TextoEstadoPipe } from './pipes/texto-estado.pipe';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';

@Component({
  selector: 'app-origami',
  templateUrl: './origami.page.html',
  styleUrls: ['./origami.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ColorEstadoPipe,
    TextoEstadoPipe,
  ],
  providers: [OrigamiService],
})
export class OrigamiPage implements OnInit {
  private origamiService = inject(OrigamiService);
  private historialService = inject(HistorialUsuarioService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  origamis = signal<Origami[]>([]);
  filtroEstado = signal<'todos' | 'sin-empezar' | 'en-ejecucion' | 'finalizado'>('todos');

  origamisFiltrados = computed(() => {
    const estado = this.filtroEstado();
    return this.origamis().filter(item =>
      estado === 'todos' || item.estadoProceso === estado
    );
  });

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

  public irATutorialDeOrigami(codigo: number, estado: string | undefined): void {
    if (estado === ESTADOS_TUTORIAL.SIN_EMPEZAR) {
      this.historialService.iniciarTutorial(codigo);
    }
    this.router.navigate(['/home/tutorial', codigo]);
  }
}
