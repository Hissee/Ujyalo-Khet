import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';

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

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    this.service.signup(this.formData)
      .subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Signup successful!';
        this.formData = { firstName: '', middleName: '', lastName: '', email: '', phone: '', province: '', city: '', street: '', password: '', role: 'consumer' };
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
      }
    });
  }

  private initForm() {
    this.userForm = this.service.createUpdateForm();
  }
}
