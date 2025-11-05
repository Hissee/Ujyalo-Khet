import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../signup-component/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-verify-password-reset-otp',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-password-reset-otp.component.html',
  styleUrl: './verify-password-reset-otp.component.css'
})
export class VerifyPasswordResetOtpComponent implements OnInit {
  otpForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);
  email: string = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  verifying = false;
  resendOTPLoading = false;

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit() {
    // Get email from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      if (!this.email) {
        this.errorMessage = 'Email is required. Please go back and request a password reset.';
      }
    });
  }

  onVerifyOTP() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    this.verifying = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otp = this.otpForm.get('otp')?.value;

    // Store email and OTP in sessionStorage
    // The reset password page will verify the OTP when submitting the form
    sessionStorage.setItem('passwordResetEmail', this.email);
    sessionStorage.setItem('passwordResetOTP', otp);
    
    // Redirect to reset password page
    this.toastService.success('OTP verified. Please enter your new password.');
    setTimeout(() => {
      this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
    }, 500);
  }

  onResendOTP() {
    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    this.resendOTPLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendPasswordResetOTP(this.email).subscribe({
      next: (res: any) => {
        this.resendOTPLoading = false;
        this.toastService.success(res.message || 'OTP resent to your email. Please check your inbox.');
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

