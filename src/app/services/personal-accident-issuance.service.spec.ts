import { TestBed } from '@angular/core/testing';

import { PersonalAccidentIssuanceService } from './personal-accident-issuance.service';

describe('PersonalAccidentIssuanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PersonalAccidentIssuanceService = TestBed.get(PersonalAccidentIssuanceService);
    expect(service).toBeTruthy();
  });
});
