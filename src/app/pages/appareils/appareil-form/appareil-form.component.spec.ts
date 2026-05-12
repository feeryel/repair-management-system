import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppareilFormComponent } from './appareil-form.component';

describe('AppareilFormComponent', () => {
  let component: AppareilFormComponent;
  let fixture: ComponentFixture<AppareilFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppareilFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppareilFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
