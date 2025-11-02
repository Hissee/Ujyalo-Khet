import { User } from './../IUser';
import { AuthService } from './../auth.service';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';

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
  }

  ngOnDestroy() {
  }

  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

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
          this.successMessage = res.message || 'Signup successful!';
          
          // Store token if provided
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          // Redirect after a short delay
          setTimeout(() => {
            if (res.token) {
              // If token is provided, redirect to home
              this.router.navigate(['/']);
            } else {
              // Otherwise redirect to login page
              this.router.navigate(['/login']);
            }
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.';
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

}
