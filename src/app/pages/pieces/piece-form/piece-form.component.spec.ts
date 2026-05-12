import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceFormComponent } from './piece-form.component';

describe('PieceFormComponent', () => {
  let component: PieceFormComponent;
  let fixture: ComponentFixture<PieceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PieceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
