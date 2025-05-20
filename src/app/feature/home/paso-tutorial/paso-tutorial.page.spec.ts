import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PasoTutorialPage } from './paso-tutorial.page';

describe('PasoTutorialPageComponent', () => {
  type NewType = PasoTutorialPage;

  let component: NewType;
  let fixture: ComponentFixture<PasoTutorialPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PasoTutorialPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PasoTutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
