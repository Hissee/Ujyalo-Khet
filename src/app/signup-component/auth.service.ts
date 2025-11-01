import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Endpoint} from '../const/end-point';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { mismatch: true };
  }

  constructor(private http: HttpClient) {}

  signup(data: any): Observable<any> {
    return this.http.post(Endpoint.SIGNUP, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(Endpoint.LOGIN, data);
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
      }
    );
  }
}
