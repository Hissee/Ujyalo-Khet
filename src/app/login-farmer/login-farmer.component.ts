import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../signup-component/auth.service';

@Component({
  selector: 'app-login-farmer',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-farmer.component.html',
  styleUrls: ['./login-farmer.component.css']
})
export class LoginFarmerComponent {
  loginForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage = '';
  loading = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        // Store token and user data
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        // Redirect to farmer dashboard
        if (res.user?.role === 'farmer') {
          this.router.navigate(['/farmer-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        console.error('Login error:', err);
      }
    });
  }
}
