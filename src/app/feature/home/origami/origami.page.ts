import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Origami } from './modelo/origami';
import { OrigamiService } from './servicios/origami.service';

@Component({
  selector: 'app-origami',
  templateUrl: './origami.page.html',
  styleUrls: ['./origami.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  providers: [OrigamiService],
})
export class OrigamiPage implements OnInit {
  private origamiService = inject(OrigamiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
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
    irATutorialDeOrigami(codigo: number): void {
    this.router.navigate(['/home/tutorial', codigo]);
  }
}
