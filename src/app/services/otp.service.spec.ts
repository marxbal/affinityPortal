import {
  TestBed,
  inject
} from '@angular/core/testing';

import {
  OTPService
} from './otp.service';

describe('OTPService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OTPService]
    });
  });

  it('should be created', inject([OTPService], (service: OTPService) => {
    expect(service).toBeTruthy();
  }));
});
