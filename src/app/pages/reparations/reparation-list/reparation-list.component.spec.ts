import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationListComponent } from './reparation-list.component';

describe('ReparationListComponent', () => {
  let component: ReparationListComponent;
  let fixture: ComponentFixture<ReparationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReparationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
