import { User } from './../IUser';
import { AuthService } from './../auth.service';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
// import {AuthService} from '../auth.service';
// import {User} from '../IUser';

@Component({
  selector: 'app-signup-consumer',
  templateUrl: './signup-consumer.component.html',
  imports: [
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

    this.service.signupCustomer(user)
      .subscribe({
        next: (res: any) => {
          this.successMessage = res.message || 'Signup successful!';
          this.userForm.reset();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
          console.error('Signup error:', err);
        }
      });
  }

}
