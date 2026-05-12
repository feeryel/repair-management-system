import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppareilListComponent } from './appareil-list.component';

describe('AppareilListComponent', () => {
  let component: AppareilListComponent;
  let fixture: ComponentFixture<AppareilListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppareilListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppareilListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
