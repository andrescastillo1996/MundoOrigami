import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Tutorial } from './modelos/tutorial';
import { TutorialService } from './servicios/tutorial.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
  imports:[CommonModule,
    FormsModule,
    IonicModule,  // <- Asegúrate que esté aquí
    RouterModule]
})
export class TutorialPage implements OnInit {
  tutorial$!: Observable<Tutorial | undefined>;

  constructor(
    private route: ActivatedRoute,
    private tutorialService: TutorialService
  ) {}

  ngOnInit() {
    this.tutorial$ = this.route.params.pipe(
      switchMap(params => {
        const codigo = Number(params['codigo']);
        return this.tutorialService.getTutorialPorCodigo(codigo);
      })
    );
  }
}

