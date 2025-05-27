import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideCore } from '@core/core';
import { registrarIconos } from '@core/iconos';

import { register } from 'swiper/element/bundle';

register();

registrarIconos();


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideCore({ routes }),
  ],
});
