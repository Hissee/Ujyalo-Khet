import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup-farmer',
  imports: [ReactiveFormsModule],
  templateUrl: './signup-farmer.component.html',
  styleUrl: './signup-farmer.component.css'
})
export class SignupFarmerComponent {
  signupForm: FormGroup;
  authService = inject(AuthService);
  successMessage = '';
  errorMessage = '';

  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      province: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Validate password match
    if (this.signupForm.hasError('mismatch')) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    const farmerData = {
      firstName: this.signupForm.get('firstName')?.value,
      middleName: this.signupForm.get('middleName')?.value || '',
      lastName: this.signupForm.get('lastName')?.value,
      email: this.signupForm.get('email')?.value,
      phone: this.signupForm.get('phone')?.value,
      province: this.signupForm.get('province')?.value,
      city: this.signupForm.get('city')?.value,
      street: this.signupForm.get('street')?.value,
      password: this.signupForm.get('password')?.value,
    };

    console.log('Farmer signup data:', farmerData);

    this.authService.signupFarmer(farmerData)
      .subscribe({
        next: (res: any) => {
          this.successMessage = res.message || 'Signup successful!';
          this.signupForm.reset();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
          console.error('Farmer signup error:', err);
        }
      });
  }
}
