import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loading?: HTMLIonLoadingElement;
  private isPresenting = false;

  constructor(private loadingCtrl: LoadingController) {}

  async present(message: string = 'Cargando...') {
    if (this.isPresenting) return; // Ya se está mostrando uno
    this.isPresenting = true;

    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });

    await this.loading.present();
  }

  async dismiss() {
    if (this.loading && this.isPresenting) {
      await this.loading.dismiss();
      this.loading = undefined;
      this.isPresenting = false;
    }
  }

  async showWhileLoading<T>(
    promise: Promise<T>,
    message: string = 'Cargando...'
  ): Promise<T> {
    await this.present(message);
    try {
      return await promise;
    } catch (error) {
      throw error;
    } finally {
      await this.dismiss();
    }
  }

  showWhileLoading$<T>(
    obs$: Observable<T>,
    message: string = 'Cargando...'
  ): Observable<T> {
    this.present(message);
    return obs$.pipe(
      finalize(() => {
        this.dismiss();
      })
    );
  }
}
