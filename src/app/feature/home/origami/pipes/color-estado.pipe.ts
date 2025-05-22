import { Pipe, PipeTransform } from '@angular/core';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';

@Pipe({
  name: 'colorEstado',
  standalone: true,
})
export class ColorEstadoPipe implements PipeTransform {
  transform(estado: string | undefined): string {
    switch (estado?.toLowerCase()) {
      case ESTADOS_TUTORIAL.SIN_EMPEZAR:
        return 'medium';
      case ESTADOS_TUTORIAL.EN_EJECUCION:
        return 'warning';
      case ESTADOS_TUTORIAL.FINALIZADO:
        return 'success';
      default:
        return 'medium';
    }
  }
}
