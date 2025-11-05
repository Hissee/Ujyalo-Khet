import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../signup-component/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Password reset OTP has been sent to your email.';
        
        // If OTP verification is required, redirect to OTP verification page
        if (res.requiresOTPVerification && res.email) {
          setTimeout(() => {
            this.router.navigate(['/verify-password-reset-otp'], { 
              queryParams: { email: res.email } 
            });
          }, 1500);
        } else {
          // Clear form if not redirecting
          this.forgotPasswordForm.reset();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to send password reset email. Please try again.';
        console.error('Forgot password error:', err);
      }
    });
  }
}
