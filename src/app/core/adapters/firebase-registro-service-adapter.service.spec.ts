/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { FirebaseRegistroServiceAdapterService } from './firebase-registro-service-adapter.service';

describe('Service: FirebaseRegistroServiceAdapter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirebaseRegistroServiceAdapterService]
    });
  });

  it('should ...', inject([FirebaseRegistroServiceAdapterService], (service: FirebaseRegistroServiceAdapterService) => {
    expect(service).toBeTruthy();
  }));
});
