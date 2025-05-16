import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrigamiPage } from './origami.page';

describe('OrigamiPage', () => {
  let component: OrigamiPage;
  let fixture: ComponentFixture<OrigamiPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrigamiPage],
    });

    fixture = TestBed.createComponent(OrigamiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
