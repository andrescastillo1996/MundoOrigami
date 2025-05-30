import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { LoaderService } from './loader.service'; // Adjust path if necessary
import { of, throwError } from 'rxjs'; // Import necessary RxJS operators

fdescribe('LoaderService', () => {
  let service: LoaderService;
  let mockLoadingController: jasmine.SpyObj<LoadingController>;
  let mockLoadingElement: jasmine.SpyObj<HTMLIonLoadingElement>;

  beforeEach(() => {
    // Create spy objects for LoadingController and the HTMLIonLoadingElement
    mockLoadingElement = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    mockLoadingController = jasmine.createSpyObj('LoadingController', ['create']);

    // Configure the mock LoadingController to return our mock loading element
    mockLoadingController.create.and.returnValue(Promise.resolve(mockLoadingElement));

    TestBed.configureTestingModule({
      providers: [
        LoaderService,
        { provide: LoadingController, useValue: mockLoadingController },
      ],
    });
    service = TestBed.inject(LoaderService);

    // Reset the internal state of the service for each test
    // This is good practice as services are singletons
    (service as any)['isPresenting'] = false;
    (service as any)['loading'] = undefined;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  it('should create and present a loading spinner with default message', async () => {
    await service.present();

    expect(mockLoadingController.create).toHaveBeenCalledWith({
      message: 'Cargando...',
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });
    expect(mockLoadingElement.present).toHaveBeenCalled();
    // Verify internal state
    expect((service as any)['isPresenting']).toBeTrue();
    expect((service as any)['loading']).toBe(mockLoadingElement);
  });

  it('should create and present a loading spinner with a custom message', async () => {
    const customMessage = 'Processing data...';
    await service.present(customMessage);

    expect(mockLoadingController.create).toHaveBeenCalledWith(jasmine.objectContaining({
      message: customMessage,
    }));
    expect(mockLoadingElement.present).toHaveBeenCalled();
    expect((service as any)['isPresenting']).toBeTrue();
  });

  it('should not present a loading spinner if one is already presenting', async () => {
    // Manually set the service state to presenting
    (service as any)['isPresenting'] = true;
    (service as any)['loading'] = mockLoadingElement; // A mock loading element needs to be present

    await service.present('New message'); // Try to present another one

    expect(mockLoadingController.create).not.toHaveBeenCalled(); // Should not create a new one
    expect(mockLoadingElement.present).not.toHaveBeenCalled(); // Should not present again
  });


  it('should dismiss the loading spinner if it is present', async () => {
    // First, simulate presenting the loader
    await service.present(); // This sets isPresenting = true and loading = mockLoadingElement
    expect(mockLoadingElement.present).toHaveBeenCalledTimes(1); // Ensure it was presented

    await service.dismiss();

    expect(mockLoadingElement.dismiss).toHaveBeenCalled();
    // Verify internal state is reset
    expect((service as any)['isPresenting']).toBeFalse();
    expect((service as any)['loading']).toBeUndefined();
  });

  it('should do nothing if no loading spinner is present', async () => {
    // Ensure state is not presenting
    (service as any)['isPresenting'] = false;
    (service as any)['loading'] = undefined;

    await service.dismiss();

    expect(mockLoadingElement.dismiss).not.toHaveBeenCalled(); // Should not call dismiss
  });

  it('should do nothing if loading element is undefined but isPresenting is true (edge case)', async () => {
    // Simulate a state where isPresenting is true but loading element didn't get set or was cleared
    (service as any)['isPresenting'] = true;
    (service as any)['loading'] = undefined;

    await service.dismiss();

    expect(mockLoadingElement.dismiss).not.toHaveBeenCalled(); // Should not call dismiss
  });


  it('should show loader, resolve promise, and dismiss loader on success', async () => {
    const testData = { id: 1, name: 'Test' };
    const testPromise = Promise.resolve(testData);

    // Spy on present and dismiss to ensure order
    const presentSpy = spyOn(service, 'present').and.callThrough();
    const dismissSpy = spyOn(service, 'dismiss').and.callThrough();

    const result = await service.showWhileLoading(testPromise);

    expect(presentSpy).toHaveBeenCalledWith('Cargando...');
    expect(result).toEqual(testData);
    expect(dismissSpy).toHaveBeenCalled();
    expect(mockLoadingElement.present).toHaveBeenCalledTimes(1);
    expect(mockLoadingElement.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should show loader, reject promise, and dismiss loader on error', async () => {
    const testError = new Error('Failed to load');
    const testPromise = Promise.reject(testError);

    const presentSpy = spyOn(service, 'present').and.callThrough();
    const dismissSpy = spyOn(service, 'dismiss').and.callThrough();

    // Use a try-catch block to handle the rejected promise
    await expectAsync(service.showWhileLoading(testPromise)).toBeRejectedWith(testError);

    expect(presentSpy).toHaveBeenCalledWith('Cargando...');
    expect(dismissSpy).toHaveBeenCalled(); // Dismiss should still be called
    expect(mockLoadingElement.present).toHaveBeenCalledTimes(1);
    expect(mockLoadingElement.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should show loader with custom message for promise', async () => {
    const customMessage = 'Fetching data...';
    const testPromise = Promise.resolve('data');
    spyOn(service, 'present').and.callThrough();

    await service.showWhileLoading(testPromise, customMessage);

    expect(service.present).toHaveBeenCalledWith(customMessage);
  });


  it('should show loader, complete observable, and dismiss loader on success', fakeAsync(() => {
    const testData = ['item1', 'item2'];
    const testObservable = of(testData); // Observable that emits testData and completes

    const presentSpy = spyOn(service, 'present').and.callThrough();
    const dismissSpy = spyOn(service, 'dismiss').and.callThrough();

    let result: string[] | undefined;
    service.showWhileLoading$(testObservable).subscribe({
      next: (data) => result = data,
      complete: () => {}, // No op
      error: () => fail('Observable should not error'),
    });

    // Initial present call happens immediately
    expect(presentSpy).toHaveBeenCalledWith('Cargando...');

    tick(); // Advance time for the observable to complete and finalize to run

    expect(result).toEqual(testData);
    expect(dismissSpy).toHaveBeenCalled();
  }));

  it('should show loader, error observable, and dismiss loader on error', fakeAsync(() => {
    const testError = new Error('Observable failed');
    const testObservable = throwError(() => testError); // Observable that errors

    const presentSpy = spyOn(service, 'present').and.callThrough();
    const dismissSpy = spyOn(service, 'dismiss').and.callThrough();

    service.showWhileLoading$(testObservable, 'Loading failed').subscribe({
      next: () => fail('Observable should not emit'),
      error: (err) => {
        expect(err).toBe(testError); // Expect the error to be passed through
      },
      complete: () => fail('Observable should not complete'),
    });

    // Initial present call happens immediately
    expect(presentSpy).toHaveBeenCalledWith('Loading failed');

    tick(); // Advance time for the observable to error and finalize to run

    expect(dismissSpy).toHaveBeenCalled();
  }));

  it('should show loader with custom message for observable', fakeAsync(() => {
    const customMessage = 'Streaming data...';
    const testObservable = of('some data');
    spyOn(service, 'present').and.callThrough(); // Spy on present method

    service.showWhileLoading$(testObservable, customMessage).subscribe(); // Subscribe to trigger present
    tick(); // Advance time for completion

    expect(service.present).toHaveBeenCalledWith(customMessage);
  }));
});