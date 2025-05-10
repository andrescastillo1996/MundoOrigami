import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  PreloadAllModules,
  Routes,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { environment } from '@env/environment';

import { provideIonicAngular } from '@ionic/angular/standalone';

export interface CoreOptions {
  routes: Routes;
}

export const CORE_GUARD: InjectionToken<string> = new InjectionToken<string>(
  'CORE_GUARD'
);

export function provideCore(coreOptions: CoreOptions): EnvironmentProviders[] {
  return [
    provideHttpClient(withFetch()),
    provideRouter(
      coreOptions.routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),

    provideIonicAngular(),

    // 🔥 Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),

    // otros providers globales...

    provideEnvironmentInitializer(() => {
      const coreGuard: string | null = inject(CORE_GUARD, {
        skipSelf: true,
        optional: true,
      });
      if (coreGuard) {
        throw new TypeError(
          `provideCore() solo debe llamarse una vez en la aplicación`
        );
      }
    }),
  ];
}
