import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupConsunerComponent } from './signup-consuner.component';

describe('SignupConsunerComponent', () => {
  let component: SignupConsunerComponent;
  let fixture: ComponentFixture<SignupConsunerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupConsunerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupConsunerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
