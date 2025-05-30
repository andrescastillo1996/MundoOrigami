import { inject, Injectable } from '@angular/core';
import { OrigamiFirestoreAdapter } from '@core/adapters/origami-firestore-adapter.service';
import { Origami } from '@core/models/origami';



@Injectable({
  providedIn: 'root',
})
export class OrigamiService {

  private origamiAdapter = inject(OrigamiFirestoreAdapter);

  async getOrigamis(): Promise<Origami[]> {
    
    return this.origamiAdapter.getAllOrigamis();
  }
}