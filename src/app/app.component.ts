import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app>
    <ion-router-outlet />
  </ion-app> `,
  standalone: true,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    try {
      const app = initializeApp(environment.firebase);
      const auth = getAuth(app);
      console.log('✅ Firebase conectado correctamente:', app.name);
    } catch (error) {
      console.error('❌ Error al conectar Firebase:', error);
    }
  }
}
