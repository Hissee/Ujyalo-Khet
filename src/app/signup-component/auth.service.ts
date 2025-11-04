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

  createUpdateForm() {
    return new FormGroup(
      {
        firstName: new FormControl('', Validators.required),
        middleName: new FormControl(''),
        lastName: new FormControl('', Validators.required),
        phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
        email: new FormControl('', [Validators.required, Validators.email]),
        province: new FormControl('', [Validators.required]),
        city: new FormControl('', Validators.required),
        street: new FormControl('', Validators.required),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', Validators.required)
      },
      { validators: this.passwordMatchValidator }
    );
  }
}
