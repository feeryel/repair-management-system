import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationFormComponent } from './reparation-form.component';

describe('ReparationFormComponent', () => {
  let component: ReparationFormComponent;
  let fixture: ComponentFixture<ReparationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReparationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
