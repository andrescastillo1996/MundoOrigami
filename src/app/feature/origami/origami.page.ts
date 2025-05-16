import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {Origami}from '../home/origami/modelo/origami'
import {OrigamiService} from '../home/origami/servicios/origami.service'


@Component({
  selector: 'app-origami',
  templateUrl: '../home/origami/origami.page.html',
  styleUrls: ['../home/origami/origami.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class OrigamiPage implements OnInit {
  private origamiService = inject(OrigamiService);
  private destroyRef = inject(DestroyRef);
  origamis = signal<Origami[]>([]);

  ngOnInit(): void {
    this.obtenerOrigamis();
  }

  private obtenerOrigamis(): void {
    this.origamiService
      .getOrigamis()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.origamis.set(data);
      });
  }
}
