import { Pipe, PipeTransform } from '@angular/core';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';

@Pipe({
  name: 'textoEstado',
  standalone: true,
})
export class TextoEstadoPipe implements PipeTransform {
  transform(estado: string | undefined): string {
    switch (estado?.toLowerCase()) {
      case ESTADOS_TUTORIAL.SIN_EMPEZAR:
        return 'Sin empezar';
      case ESTADOS_TUTORIAL.EN_EJECUCION:
        return 'En ejecución';
      case ESTADOS_TUTORIAL.FINALIZADO:
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  }
}
