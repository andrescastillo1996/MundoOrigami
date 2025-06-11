import { TestBed } from '@angular/core/testing';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'; // Import ActivatedRouteSnapshot and RouterStateSnapshot
import { SesionService } from '@core/autenticacion/sesion.service';
import { authGuard } from './auth.guard';
import { ROLES, RUTAS } from '@core/constantes/constantes';
import { RouterTestingModule } from '@angular/router/testing';
import { UsuarioTestDataBuilder } from '@core/mocks/usuario-test-data-builder';

describe('authGuard', () => {
  let router: Router;
  let sesionService: jasmine.SpyObj<SesionService>;

  // Define a dummy component for RouterTestingModule.withRoutes()
  class DummyComponent {}

  // Create mock snapshots for ActivatedRouteSnapshot and RouterStateSnapshot
  // Since your guard doesn't use their content, empty objects cast as 'any' or
  // as the actual types are sufficient.
  const mockActivatedRouteSnapshot: ActivatedRouteSnapshot =
    {} as ActivatedRouteSnapshot;
  const mockRouterStateSnapshot: RouterStateSnapshot = {
    url: '/',
  } as RouterStateSnapshot; // url is often required

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    sesionService = jasmine.createSpyObj('SesionService', ['obtener']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: DummyComponent },
        ]),
      ],
      providers: [
        { provide: Router, useValue: router },
        { provide: SesionService, useValue: sesionService },
      ],
    });

    router = TestBed.inject(Router);
    sesionService = TestBed.inject(
      SesionService
    ) as jasmine.SpyObj<SesionService>;
  });

  // --- Test Cases ---

  it('should return true if user is logged in and no role is required', () => {
    const usuario = new UsuarioTestDataBuilder().conUuid('112313').construir();
    sesionService.obtener.and.returnValue(usuario);

    // Pass mock snapshot arguments to the inner guard function
    const canActivate = TestBed.runInInjectionContext(() =>
      authGuard()(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    expect(canActivate).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should return true if user is logged in and has the required role', () => {
    const usuario = new UsuarioTestDataBuilder()
      .conUuid('112313')
      .conEmail('email@gmail.com')
      .conRoles([ROLES.ADMINISTRADOR, ROLES.USUARIO])
      .construir();
    sesionService.obtener.and.returnValue(usuario);

    // Pass mock snapshot arguments
    const canActivate = TestBed.runInInjectionContext(() =>
      authGuard(ROLES.ADMINISTRADOR)(
        mockActivatedRouteSnapshot,
        mockRouterStateSnapshot
      )
    );

    expect(canActivate).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should return true if user is logged in and has one of multiple required roles', () => {
    const usuario = new UsuarioTestDataBuilder()
      .conUuid('112313')
      .conNombre('diego')
      .conRoles(['editor', ROLES.USUARIO])
      .construir();
    sesionService.obtener.and.returnValue(usuario);

    // Pass mock snapshot arguments
    const canActivate = TestBed.runInInjectionContext(() =>
      authGuard('editor')(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    expect(canActivate).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should return false and navigate to login if user is not logged in', () => {
    sesionService.obtener.and.returnValue(null);

    // Pass mock snapshot arguments
    const canActivate = TestBed.runInInjectionContext(() =>
      authGuard()(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    expect(canActivate).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith(RUTAS.LOGIN);
  });

  it('should return false and navigate to login if user is logged in but does NOT have the required role', () => {
    const usuario = new UsuarioTestDataBuilder().conUuid('112313').construir();
    sesionService.obtener.and.returnValue(usuario);

    // Pass mock snapshot arguments
    const canActivate = TestBed.runInInjectionContext(() =>
      authGuard('admin')(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );

    expect(canActivate).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith(RUTAS.LOGIN);
  });
});
