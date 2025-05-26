/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CargarArchivosService } from './cargar-archivos.service';

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
