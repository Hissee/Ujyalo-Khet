import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../signup-component/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  token: string | null = null;
  email: string | null = null;
  verificationForm: FormGroup;
  resendForm: FormGroup;
  
  loading = false;
  verifying = false;
  verified = false;
  errorMessage = '';
  successMessage = '';
  resendSuccessMessage = '';
  resendErrorMessage = '';

  constructor() {
    this.verificationForm = this.fb.group({
      token: ['', Validators.required]
    });

    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Get token and email from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;
      
      if (this.token && this.email) {
        // Auto-verify if token and email are present in URL
        this.verifyEmail();
      }
      
      if (this.email) {
        this.resendForm.patchValue({ email: this.email });
      }
    });
  }

  verifyEmail() {
    if (!this.token || !this.email) {
      this.errorMessage = 'Please enter the verification token from your email.';
      return;
    }

    this.verifying = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyEmail(this.token, this.email).subscribe({
      next: (res: any) => {
        this.verifying = false;
        this.verified = true;
        this.successMessage = res.message || 'Email verified successfully!';
        
        // If token and user are provided (signup verification), auto-login
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // Redirect based on user role
          setTimeout(() => {
            if (res.user.role === 'farmer') {
              this.router.navigate(['/farmer-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 2000);
        } else {
          // Regular email verification (existing user), redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err) => {
        this.verifying = false;
        this.errorMessage = err.error?.message || 'Verification failed. Please check your token and try again.';
        console.error('Verification error:', err);
      }
    });
  }

  onSubmitVerification() {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    const token = this.verificationForm.get('token')?.value;
    const email = this.email || this.resendForm.get('email')?.value;

    if (!email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    this.token = token;
    this.email = email;
    this.verifyEmail();
  }

  resendVerificationEmail() {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.resendSuccessMessage = '';
    this.resendErrorMessage = '';

    const email = this.resendForm.get('email')?.value;

    this.authService.resendVerificationEmail(email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.resendSuccessMessage = res.message || 'Verification email sent successfully!';
      },
      error: (err) => {
        this.loading = false;
        this.resendErrorMessage = err.error?.message || 'Failed to resend verification email. Please try again.';
        console.error('Resend error:', err);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

