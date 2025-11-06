import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {Endpoint} from '../const/end-point';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  // Strong password validator
  strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minlength'] = true;
    }
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }
    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }
    if (!/[0-9]/.test(password)) {
      errors['number'] = true;
    }
    // Special characters: @, $, !, %, *, ?, & and other common special characters
    if (!/[@$!%*?&_+\-=\[\]{};':"\\|,.<>\/()^#]/.test(password)) {
      errors['special'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Name validator (letters, spaces, hyphens only, 2-50 characters)
  nameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const name = control.value.trim();
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;

    if (name.length < 2) {
      return { minlength: true };
    }
    if (name.length > 50) {
      return { maxlength: true };
    }
    if (!nameRegex.test(name)) {
      return { invalidFormat: true };
    }

    return null;
  }

  // Phone validator for Nepal (10 digits, typically starts with 9)
  phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const phone = control.value.trim();
    const phoneRegex = /^9[0-9]{9}$/; // Nepal mobile numbers start with 9

    if (!/^[0-9]{10}$/.test(phone)) {
      return { invalidFormat: true };
    }
    if (!phoneRegex.test(phone)) {
      return { invalidPrefix: true };
    }

    return null;
  }

  // Email validator (stronger)
  emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return { invalidFormat: true };
    }

    // Additional checks
    if (email.length > 100) {
      return { maxlength: true };
    }
    if (email.includes('..') || email.startsWith('.') || email.startsWith('@')) {
      return { invalidFormat: true };
    }

    return null;
  }

  constructor(private http: HttpClient) {}

  signupCustomer(data: any): Observable<any> {
    return this.http.post(Endpoint.SIGNUP_CUSTOMER, data);
  }

  signupFarmer(data: any): Observable<any> {
    return this.http.post(Endpoint.SIGNUP_FARMER, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(Endpoint.LOGIN, data);
  }

  verifyEmail(token: string, email: string): Observable<any> {
    return this.http.post(Endpoint.VERIFY_EMAIL, { token, email });
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(Endpoint.RESEND_VERIFICATION, { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(Endpoint.FORGOT_PASSWORD, { email });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(Endpoint.RESET_PASSWORD, { email, otp, newPassword });
  }

  resendPasswordResetOTP(email: string): Observable<any> {
    return this.http.post(Endpoint.RESEND_PASSWORD_RESET_OTP, { email });
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(Endpoint.VERIFY_OTP, { email, otp });
  }

  resendOTP(email: string): Observable<any> {
    return this.http.post(Endpoint.RESEND_OTP, { email });
  }

  createUpdateForm() {
    return new FormGroup(
      {
        firstName: new FormControl('', [Validators.required, this.nameValidator]),
        middleName: new FormControl('', [this.nameValidator]),
        lastName: new FormControl('', [Validators.required, this.nameValidator]),
        phone: new FormControl('', [Validators.required, this.phoneValidator]),
        email: new FormControl('', [Validators.required, this.emailValidator]),
        province: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
        street: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]),
        password: new FormControl('', [Validators.required, this.strongPasswordValidator]),
        confirmPassword: new FormControl('', Validators.required)
      },
      { validators: this.passwordMatchValidator }
    );
  }
}
