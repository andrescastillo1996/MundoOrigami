import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({"projectId":"mundoorigami-c963e","appId":"1:359659078282:web:694b29a419b0922661a373","storageBucket":"mundoorigami-c963e.appspot.com","apiKey":"AIzaSyDCcqe0rTmYSsZ2LPbBYdJbcZNSHe9bGZI","authDomain":"mundoorigami-c963e.firebaseapp.com","messagingSenderId":"359659078282","measurementId":"G-4YF297E3YK"})), provideFirestore(() => getFirestore())],
  bootstrap: [AppComponent],
})
export class AppModule {}
