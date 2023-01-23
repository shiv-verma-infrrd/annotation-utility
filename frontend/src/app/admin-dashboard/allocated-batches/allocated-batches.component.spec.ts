import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocatedBatchesComponent } from './allocated-batches.component';

describe('AllocatedBatchesComponent', () => {
  let component: AllocatedBatchesComponent;
  let fixture: ComponentFixture<AllocatedBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllocatedBatchesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocatedBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
