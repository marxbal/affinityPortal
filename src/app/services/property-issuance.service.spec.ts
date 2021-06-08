import { TestBed } from '@angular/core/testing';

import { PropertyIssuanceService } from './property-issuance.service';

describe('PropertyIssuanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PropertyIssuanceService = TestBed.get(PropertyIssuanceService);
    expect(service).toBeTruthy();
  });
});
