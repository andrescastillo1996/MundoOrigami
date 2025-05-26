/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { CrearOrigamiService } from './administrar-origami.service';

describe('Service: CrearOrigami', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrearOrigamiService],
    });
  });

  it('should ...', inject(
    [CrearOrigamiService],
    (service: CrearOrigamiService) => {
      expect(service).toBeTruthy();
    }
  ));
});
