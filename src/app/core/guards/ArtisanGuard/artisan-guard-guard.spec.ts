import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { artisanGuardGuard } from './artisan-guard-guard';

describe('artisanGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => artisanGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
