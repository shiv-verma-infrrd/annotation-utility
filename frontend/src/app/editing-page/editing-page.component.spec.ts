import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingPageComponent } from './editing-page.component';

describe('EditingPageComponent', () => {
  let component: EditingPageComponent;
  let fixture: ComponentFixture<EditingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
