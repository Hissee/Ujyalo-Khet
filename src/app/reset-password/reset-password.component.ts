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
  token: string = '';
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
    // Get token and email from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      if (!this.token || !this.email) {
        this.tokenValid = false;
        this.errorMessage = 'Invalid or missing reset token. Please request a new password reset link.';
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.token || !this.email) {
      this.errorMessage = 'Invalid or missing reset token.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(this.token, this.email, newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Password reset successfully. You can now log in with your new password.';
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. The link may have expired. Please request a new one.';
        console.error('Reset password error:', err);
      }
    });
  }

  getPasswordMismatchError(): boolean {
    return this.resetPasswordForm.hasError('mismatch') && 
           !!this.resetPasswordForm.get('confirmPassword')?.touched;
  }
}
