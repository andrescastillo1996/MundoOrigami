// src/app/services/cargar-archivos.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { CargarArchivosService } from './cargar-archivos.service';
import { FirebaseStorageAdapterService } from '../adapters/firebase-storage-adapter.service';
import { of, throwError } from 'rxjs';

type SpyObj<T> = jasmine.SpyObj<T>;

describe('CargarArchivosService', () => {
  let service: CargarArchivosService;
  let mockFirebaseStorageAdapterService: SpyObj<FirebaseStorageAdapterService>;

  beforeEach(() => {
    mockFirebaseStorageAdapterService = jasmine.createSpyObj(
      'FirebaseStorageAdapterService',
      ['createRef', 'uploadBytes', 'getDownloadURL']
    );

    TestBed.configureTestingModule({
      providers: [
        CargarArchivosService,
        {
          provide: FirebaseStorageAdapterService,
          useValue: mockFirebaseStorageAdapterService,
        },
      ],
    });

    service = TestBed.inject(CargarArchivosService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadImage', () => {
    const mockPath = 'images/profile';
    const mockFile = new File(['dummy content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    const mockDownloadURL = 'https://example.com/download-url/test-image.jpg';
    const mockStorageRef = {} as any;
    beforeEach(() => {
      mockFirebaseStorageAdapterService.createRef.and.returnValue(
        mockStorageRef
      );
    });

    it('debería subir la imagen y devolver la URL de descarga exitosamente', done => {
      mockFirebaseStorageAdapterService.uploadBytes.and.returnValue(
        of({} as any)
      );
      mockFirebaseStorageAdapterService.getDownloadURL.and.returnValue(
        of(mockDownloadURL)
      );

      service.uploadImage(mockPath, mockFile).subscribe({
        next: url => {
          expect(url).toBe(mockDownloadURL);

          expect(
            mockFirebaseStorageAdapterService.createRef
          ).toHaveBeenCalled();
          expect(
            mockFirebaseStorageAdapterService.uploadBytes
          ).toHaveBeenCalledWith(mockStorageRef, mockFile);
          expect(
            mockFirebaseStorageAdapterService.getDownloadURL
          ).toHaveBeenCalledWith(mockStorageRef);

          done();
        },
        error: err => {
          fail('La carga de imagen no debería haber fallado: ' + err);
          done();
        },
      });
    });

    it('debería manejar errores si uploadBytes falla', done => {
      const uploadError = new Error('Error al subir bytes');
      mockFirebaseStorageAdapterService.uploadBytes.and.returnValue(
        throwError(() => uploadError)
      );
      mockFirebaseStorageAdapterService.getDownloadURL.and.returnValue(
        of(mockDownloadURL)
      );

      service.uploadImage(mockPath, mockFile).subscribe({
        next: () => {
          fail('La carga de imagen debería haber fallado');
          done();
        },
        error: err => {
          expect(err).toBe(uploadError);
          expect(
            mockFirebaseStorageAdapterService.getDownloadURL
          ).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('debería manejar errores si getDownloadURL falla', done => {
      const downloadError = new Error('Error al obtener URL de descarga');
      mockFirebaseStorageAdapterService.uploadBytes.and.returnValue(
        of({} as any)
      );
      // Simulamos que getDownloadURL falla
      mockFirebaseStorageAdapterService.getDownloadURL.and.returnValue(
        throwError(() => downloadError)
      );

      service.uploadImage(mockPath, mockFile).subscribe({
        next: () => {
          fail('La carga de imagen debería haber fallado');
          done();
        },
        error: err => {
          expect(err).toBe(downloadError);
          done();
        },
      });
    });
  });
});
