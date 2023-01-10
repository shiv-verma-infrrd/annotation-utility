import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewUsersComponent } from './create-new-users.component';

describe('CreateNewUsersComponent', () => {
  let component: CreateNewUsersComponent;
  let fixture: ComponentFixture<CreateNewUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
