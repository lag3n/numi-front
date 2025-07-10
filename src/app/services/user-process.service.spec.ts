import { TestBed } from '@angular/core/testing';

import { UserProcessService } from './user-process.service';

describe('UserProcessService', () => {
  let service: UserProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
