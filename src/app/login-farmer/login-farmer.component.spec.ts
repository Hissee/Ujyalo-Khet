import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFarmerComponent } from './login-farmer.component';

describe('LoginFarmerComponent', () => {
  let component: LoginFarmerComponent;
  let fixture: ComponentFixture<LoginFarmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFarmerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFarmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
