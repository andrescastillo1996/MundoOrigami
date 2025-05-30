import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SesionService } from '@core/autenticacion/sesion.service';
import { publicoGuard } from './publico.guard'; // Adjust path if necessary
import { ROLES, RUTAS } from '@core/constantes/constantes'; // Adjust path if necessary
import { RouterTestingModule } from '@angular/router/testing';
import { UsuarioTestDataBuilder } from '@core/mocks/usuario-test-data-builder';

describe('publicoGuard', () => {
  let router: Router;
  let sesionService: jasmine.SpyObj<SesionService>;

  // A dummy component for RouterTestingModule's routes
  class DummyComponent {}

  // Mock snapshots for ActivatedRouteSnapshot and RouterStateSnapshot
  const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
  const mockRouterStateSnapshot: RouterStateSnapshot = { url: '/' } as RouterStateSnapshot;

  beforeEach(() => {
    // Create spy objects for Router and SesionService
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    sesionService = jasmine.createSpyObj('SesionService', ['obtener']);

    TestBed.configureTestingModule({
      imports: [
        // Provide a minimal router environment
        RouterTestingModule.withRoutes([{ path: '', component: DummyComponent }]),
      ],
      providers: [
        // Provide the mock services
        { provide: Router, useValue: router },
        { provide: SesionService, useValue: sesionService },
      ],
    });

    // Inject the real instances of the mocked services from TestBed
    router = TestBed.inject(Router);
    sesionService = TestBed.inject(SesionService) as jasmine.SpyObj<SesionService>;
  });

  // --- Test Cases ---

  it('should return true and allow navigation if no user is logged in', () => {
    // Simulate no logged-in user
    sesionService.obtener.and.returnValue(null);

    // Call the guard function within the injection context
    const canActivate = TestBed.runInInjectionContext(() =>
      publicoGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    // Expect the guard to allow activation
    expect(canActivate).toBeTrue();
    // No redirection should occur
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should return false and navigate to ADMINISTRADOR if an ADMIN user is logged in', () => {

        const usuario = new UsuarioTestDataBuilder()
          .conUuid('112313')
          .conNombre('diego')
          .conRoles([ROLES.ADMINISTRADOR])
          .construir();
    // Simulate an admin user logged in
    sesionService.obtener.and.returnValue(usuario);

    const canActivate = TestBed.runInInjectionContext(() =>
      publicoGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    // Expect the guard to prevent activation
    expect(canActivate).toBeFalse();
    // Expect redirection to the admin route
    expect(router.navigateByUrl).toHaveBeenCalledWith(RUTAS.ADMINISTRADOR);
  });

  it('should return false and navigate to HOME if a non-ADMIN user is logged in', () => {

    const usuario = new UsuarioTestDataBuilder()
    .conUuid('112313')
    .conNombre('diego')
    .construir();
    // Simulate a regular user logged in
    sesionService.obtener.and.returnValue(usuario);

    const canActivate = TestBed.runInInjectionContext(() =>
      publicoGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    // Expect the guard to prevent activation
    expect(canActivate).toBeFalse();
    // Expect redirection to the home route
    expect(router.navigateByUrl).toHaveBeenCalledWith(RUTAS.HOME);
  });

  it('should return false and navigate to HOME if a user with no specific role is logged in', () => {

    const usuario = new UsuarioTestDataBuilder()
    .conUuid('112313')
    .conNombre('diego')
    .conRoles([])
    .construir();
    // Simulate a user logged in with no roles or an empty roles array
    sesionService.obtener.and.returnValue(usuario);

    const canActivate = TestBed.runInInjectionContext(() =>
      publicoGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    expect(canActivate).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith(RUTAS.HOME);
  });

 
});