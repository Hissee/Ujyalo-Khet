import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../signup-component/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  errorMessage = '';
  successMessage = '';
  loading = false;
  email: string = '';
  tokenValid = true;

  passwordMatchValidator = (control: AbstractControl) => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  };

  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get email from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      // Get OTP from sessionStorage (set by verify-password-reset-otp component)
      const storedOTP = sessionStorage.getItem('passwordResetOTP');
      const storedEmail = sessionStorage.getItem('passwordResetEmail');
      
      if (!this.email && storedEmail) {
        this.email = storedEmail;
      }
      
      if (!this.email || !storedOTP) {
        this.tokenValid = false;
        this.errorMessage = 'Please verify your OTP first. Go back to forgot password and request a new OTP.';
      } else {
        this.tokenValid = true;
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    // Get OTP from sessionStorage
    const otp = sessionStorage.getItem('passwordResetOTP');
    const storedEmail = sessionStorage.getItem('passwordResetEmail');
    
    const emailToUse = this.email || storedEmail;

    if (!otp || !emailToUse) {
      this.errorMessage = 'Invalid or missing OTP. Please verify your OTP first.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(emailToUse, otp, newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Password reset successfully. You can now log in with your new password.';
        
        // Clear sessionStorage
        sessionStorage.removeItem('passwordResetOTP');
        sessionStorage.removeItem('passwordResetEmail');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. The OTP may have expired. Please request a new one.';
        console.error('Reset password error:', err);
        
        // Clear sessionStorage on error
        sessionStorage.removeItem('passwordResetOTP');
        sessionStorage.removeItem('passwordResetEmail');
      }
    });
  }

  getPasswordMismatchError(): boolean {
    return this.resetPasswordForm.hasError('mismatch') && 
           !!this.resetPasswordForm.get('confirmPassword')?.touched;
  }
}
