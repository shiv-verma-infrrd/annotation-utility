import { TestBed } from '@angular/core/testing';

import { AdminServiceService } from './admin-services.service';

describe('AdminServicesService', () => {
  let service: AdminServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
