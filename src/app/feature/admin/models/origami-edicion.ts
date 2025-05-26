import { Origami } from '@core/models/origami';
import { PasoTutorial } from '@core/models/paso-tutorial';

export interface OrigamiEdicion {
  origami: Origami;
  pasos: PasoTutorial[];
}
