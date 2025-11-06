import { User } from './../IUser';
import { AuthService } from './../auth.service';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup-consumer',
  templateUrl: './signup-consumer.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./signup-consumer.component.css']
})
export class SignupConsumerComponent implements OnInit, OnDestroy {
  userForm: FormGroup = new FormGroup({});

  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];
  service = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  loading = false;



  formData = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    province: '',
    city: '',
    street: '',
    password: '',
    role: 'consumer'
  };

  ngOnInit() {
    this.initForm();
    this.initOTPForm();
  }

  private initOTPForm() {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnDestroy() {
  }

  successMessage = '';
  errorMessage = '';
  showOTPForm = false;
  userEmail = '';
  otpForm: FormGroup = new FormGroup({});
  resendOTPLoading = false;
  resendOTPMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  private initForm() {
    this.userForm = this.service.createUpdateForm();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Validate password match
    if (this.userForm.hasError('mismatch')) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    
    const user = {
      firstName: this.userForm.get('firstName')?.value,
      middleName: this.userForm.get('middleName')?.value || '',
      lastName: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      phone: this.userForm.get('phone')?.value,
      province: this.userForm.get('province')?.value,
      city: this.userForm.get('city')?.value,
      street: this.userForm.get('street')?.value,
      password: this.userForm.get('password')?.value,
    };
    
    console.log('Signup data:', user);

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.service.signupCustomer(user)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          
          // If OTP verification is required, show OTP form
          if (res.requiresOTPVerification) {
            this.showOTPForm = true;
            this.userEmail = res.email || user.email;
            this.errorMessage = '';
            const message = res.message || 'OTP sent to your email. Please verify to complete signup.';
            this.toastService.success(message);
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
                // If token is provided and email is verified, redirect to home
                this.router.navigate(['/']);
              } else {
                // Otherwise redirect to login page
                this.router.navigate(['/login']);
              }
            }, 2000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.';
          this.toastService.error(err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.');
          console.error('Signup error:', err);
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
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

    this.service.verifyOTP(this.userEmail, otp)
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

          // Email is already verified via OTP, redirect to home
          setTimeout(() => {
            if (res.token && res.user?.emailVerified) {
              // User is logged in and email is verified, go to home
              this.router.navigate(['/']);
            } else {
              // Go to login page
              this.router.navigate(['/login']);
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

    this.service.resendOTP(this.userEmail)
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
