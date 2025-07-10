import { TestBed } from '@angular/core/testing';

import { ImageProcessService } from './image-process.service';

describe('ImageProcessService', () => {
  let service: ImageProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
