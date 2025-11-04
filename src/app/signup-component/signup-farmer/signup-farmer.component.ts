import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup-farmer',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-farmer.component.html',
  styleUrl: './signup-farmer.component.css'
})
export class SignupFarmerComponent {
  signupForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  successMessage = '';
  errorMessage = '';
  loading = false;

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

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('Farmer signup data:', farmerData);

    this.authService.signupFarmer(farmerData)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = res.message || 'Signup successful!';
          
          // Store token if provided
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          // If email verification is required, show message and redirect to verify page
          if (res.requiresEmailVerification) {
            this.successMessage = 'Signup successful! Please check your email to verify your account before logging in.';
            setTimeout(() => {
              this.router.navigate(['/verify-email'], { 
                queryParams: { email: res.user?.email } 
              });
            }, 3000);
          } else {
            // Redirect after a short delay
            setTimeout(() => {
              if (res.token) {
                // If token is provided, redirect to dashboard
                this.router.navigate(['/farmer-dashboard']);
              } else {
                // Otherwise redirect to login page
                this.router.navigate(['/login-farmer']);
              }
            }, 2000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.';
          console.error('Farmer signup error:', err);
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login-farmer']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
