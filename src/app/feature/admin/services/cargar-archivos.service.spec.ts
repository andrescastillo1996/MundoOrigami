/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { CargarArchivosService } from '../../../core/cargar-archivo/cargar-archivos.service';

describe('Service: CargarArchivos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CargarArchivosService],
    });
  });

  it('should ...', inject(
    [CargarArchivosService],
    (service: CargarArchivosService) => {
      expect(service).toBeTruthy();
    }
  ));
});
