import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupKhetaloComponent } from './signup-khetalo.component';

describe('SignupKhetaloComponent', () => {
  let component: SignupKhetaloComponent;
  let fixture: ComponentFixture<SignupKhetaloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupKhetaloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupKhetaloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
