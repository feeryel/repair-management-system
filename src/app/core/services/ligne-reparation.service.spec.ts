import { TestBed } from '@angular/core/testing';

import { LigneReparationService } from './ligne-reparation.service';

describe('LigneReparationService', () => {
  let service: LigneReparationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LigneReparationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
