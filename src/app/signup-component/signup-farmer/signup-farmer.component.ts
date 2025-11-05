import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastService } from '../../services/toast.service';

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
  toastService = inject(ToastService);
  successMessage = '';
  errorMessage = '';
  loading = false;
  showOTPForm = false;
  userEmail = '';
  otpForm: FormGroup = new FormGroup({});
  resendOTPLoading = false;
  resendOTPMessage = '';

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
    
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
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
          
          // If OTP verification is required, show OTP form
          if (res.requiresOTPVerification) {
            this.showOTPForm = true;
            this.userEmail = res.email || farmerData.email;
            this.successMessage = res.message || 'OTP sent to your email. Please verify to complete signup.';
            this.errorMessage = '';
            this.toastService.success(res.message || 'OTP sent to your email. Please verify to complete signup.');
          } else {
            this.successMessage = res.message || 'Signup successful!';
            this.toastService.success(res.message || 'Signup successful!');
            
            // Store token if provided
            if (res.token) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            // Email verification now handled via OTP, no need for separate email verification
            // Redirect after a short delay
            setTimeout(() => {
              if (res.token && res.user?.emailVerified) {
                // If token is provided and email is verified, redirect to dashboard
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
          this.toastService.error(err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.');
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

  onVerifyOTP() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOTP(this.userEmail, otp)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = res.message || 'Signup successful!';
          this.toastService.success(res.message || 'Email verified successfully!');
          
          // Store token if provided
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          // Email is already verified via OTP, redirect to dashboard or login
          setTimeout(() => {
            if (res.token && res.user?.emailVerified) {
              // User is logged in and email is verified, go to farmer dashboard
              this.router.navigate(['/farmer-dashboard']);
            } else {
              // Go to login page
              this.router.navigate(['/login-farmer']);
            }
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
          this.toastService.error(err.error?.message || 'Invalid OTP. Please try again.');
          console.error('OTP verification error:', err);
        }
      });
  }

  onResendOTP() {
    this.resendOTPLoading = true;
    this.resendOTPMessage = '';
    this.errorMessage = '';

    this.authService.resendOTP(this.userEmail)
      .subscribe({
        next: (res: any) => {
          this.resendOTPLoading = false;
          this.resendOTPMessage = res.message || 'OTP resent to your email.';
          this.toastService.success(res.message || 'OTP resent to your email.');
          this.otpForm.reset();
        },
        error: (err) => {
          this.resendOTPLoading = false;
          this.errorMessage = err.error?.message || 'Failed to resend OTP. Please try again.';
          this.toastService.error(err.error?.message || 'Failed to resend OTP. Please try again.');
          console.error('Resend OTP error:', err);
        }
      });
  }
}
