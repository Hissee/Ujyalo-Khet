import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastService } from '../../services/toast.service';
import { LocationService, Province, District, Municipality, Ward } from '../../services/location.service';

@Component({
  selector: 'app-signup-farmer',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-farmer.component.html',
  styleUrl: './signup-farmer.component.css'
})
export class SignupFarmerComponent implements OnInit {
  signupForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  locationService = inject(LocationService);
  successMessage = '';
  errorMessage = '';
  loading = false;
  showOTPForm = false;
  userEmail = '';
  otpForm: FormGroup = new FormGroup({});
  resendOTPLoading = false;
  resendOTPMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  // Location data
  provinces: Province[] = [];
  districts: District[] = [];
  municipalities: Municipality[] = [];
  wards: Ward[] = [];
  loadingProvinces = false;
  loadingDistricts = false;
  loadingMunicipalities = false;
  loadingWards = false;

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, this.nameValidator]],
      middleName: ['', [this.nameValidator]],
      lastName: ['', [Validators.required, this.nameValidator]],
      phone: ['', [Validators.required, this.phoneValidator]],
      email: ['', [Validators.required, this.emailValidator]],
      province: ['', Validators.required],
      district: ['', Validators.required],
      municipality: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      password: ['', [Validators.required, this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    // Watch for province changes to load districts
    this.signupForm.get('province')?.valueChanges.subscribe(provinceId => {
      if (provinceId) {
        this.onProvinceChange(provinceId);
      } else {
        this.districts = [];
        this.municipalities = [];
        this.wards = [];
        this.signupForm.patchValue({ district: '', municipality: '', ward: '' }, { emitEvent: false });
      }
    });

    // Watch for district changes to load municipalities
    this.signupForm.get('district')?.valueChanges.subscribe(districtId => {
      if (districtId) {
        this.onDistrictChange(districtId);
      } else {
        this.municipalities = [];
        this.wards = [];
        this.signupForm.patchValue({ municipality: '', ward: '' }, { emitEvent: false });
      }
    });

    // Watch for municipality changes to load wards
    this.signupForm.get('municipality')?.valueChanges.subscribe(municipalityId => {
      if (municipalityId) {
        this.onMunicipalityChange(municipalityId);
      } else {
        this.wards = [];
        this.signupForm.patchValue({ ward: '' }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.loadProvinces();
  }

  loadProvinces() {
    this.loadingProvinces = true;
    this.locationService.getProvinces().subscribe({
      next: (provinces) => {
        this.provinces = provinces;
        this.loadingProvinces = false;
      },
      error: (err) => {
        console.error('Error loading provinces:', err);
        this.toastService.error('Failed to load provinces. Please refresh the page.');
        this.loadingProvinces = false;
      }
    });
  }

  onProvinceChange(provinceId: number) {
    this.loadingDistricts = true;
    this.districts = [];
    this.municipalities = [];
    this.wards = [];
    this.signupForm.patchValue({ district: '', municipality: '', ward: '' }, { emitEvent: false });

    this.locationService.getDistrictsByProvince(provinceId).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.loadingDistricts = false;
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.toastService.error('Failed to load districts.');
        this.loadingDistricts = false;
      }
    });
  }

  onDistrictChange(districtId: number) {
    this.loadingMunicipalities = true;
    this.municipalities = [];
    this.wards = [];
    this.signupForm.patchValue({ municipality: '', ward: '' }, { emitEvent: false });

    this.locationService.getMunicipalitiesByDistrict(districtId).subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities;
        this.loadingMunicipalities = false;
      },
      error: (err) => {
        console.error('Error loading municipalities:', err);
        // Note: Municipality data might not be fully implemented yet
        this.loadingMunicipalities = false;
      }
    });
  }

  onMunicipalityChange(municipalityId: number) {
    this.loadingWards = true;
    this.wards = [];
    this.signupForm.patchValue({ ward: '' }, { emitEvent: false });

    this.locationService.getWardsByMunicipality(municipalityId).subscribe({
      next: (wards) => {
        this.wards = wards;
        this.loadingWards = false;
      },
      error: (err) => {
        console.error('Error loading wards:', err);
        // Note: Ward data might not be fully implemented yet
        this.loadingWards = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  // Strong password validator
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
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
  nameValidator(control: AbstractControl): ValidationErrors | null {
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
  phoneValidator(control: AbstractControl): ValidationErrors | null {
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
  emailValidator(control: AbstractControl): ValidationErrors | null {
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

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Validate password match
    if (this.signupForm.hasError('mismatch')) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    // Get selected location names - convert form values to numbers for comparison
    const provinceId = Number(this.signupForm.get('province')?.value);
    const districtId = Number(this.signupForm.get('district')?.value);
    const municipalityId = Number(this.signupForm.get('municipality')?.value);
    const wardId = Number(this.signupForm.get('ward')?.value);
    
    const selectedProvince = this.provinces.find(p => p.id === provinceId);
    const selectedDistrict = this.districts.find(d => d.id === districtId);
    const selectedMunicipality = this.municipalities.find(m => m.id === municipalityId);
    const selectedWard = this.wards.find(w => w.id === wardId);

    const farmerData = {
      firstName: this.signupForm.get('firstName')?.value?.trim() || '',
      middleName: this.signupForm.get('middleName')?.value?.trim() || '',
      lastName: this.signupForm.get('lastName')?.value?.trim() || '',
      email: this.signupForm.get('email')?.value?.trim() || '',
      phone: this.signupForm.get('phone')?.value?.trim() || '',
      province: selectedProvince?.name || '',
      district: selectedDistrict?.name || '',
      municipality: selectedMunicipality?.name || '',
      ward: selectedWard?.name || '',
      street: this.signupForm.get('street')?.value?.trim() || '',
      password: this.signupForm.get('password')?.value || '',
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('Farmer signup data:', farmerData);

    this.authService.signupFarmer(farmerData)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          
          // If OTP verification is required, show OTP form
          if (res.requiresOTPVerification) {
            this.showOTPForm = true;
            this.userEmail = res.email || farmerData.email;
            this.errorMessage = '';
            const message = res.message || 'OTP sent to your email. Please verify to complete signup.';
            this.toastService.success(message);
          } else {
            this.successMessage = res.message || 'Signup successful!';
            this.toastService.success(res.message || 'Signup successful!');
            
            // Store token if provided
            if (res.token) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            // Email verification now handled via OTP, no need for separate email verification
            // Redirect after a short delay
            setTimeout(() => {
              if (res.token && res.user?.emailVerified) {
                // If token is provided and email is verified, redirect to dashboard
                this.router.navigate(['/farmer-dashboard']);
              } else {
                // Otherwise redirect to login page
                this.router.navigate(['/login-farmer']);
              }
            }, 2000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.';
          this.toastService.error(err.error?.message || err.error?.errors?.join(', ') || 'Signup failed. Please try again.');
          console.error('Farmer signup error:', err);
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login-farmer']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  onVerifyOTP() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOTP(this.userEmail, otp)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = res.message || 'Signup successful!';
          this.toastService.success(res.message || 'Email verified successfully!');
          
          // Store token if provided
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          // Email is already verified via OTP, redirect to dashboard or login
          setTimeout(() => {
            if (res.token && res.user?.emailVerified) {
              // User is logged in and email is verified, go to farmer dashboard
              this.router.navigate(['/farmer-dashboard']);
            } else {
              // Go to login page
              this.router.navigate(['/login-farmer']);
            }
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
          this.toastService.error(err.error?.message || 'Invalid OTP. Please try again.');
          console.error('OTP verification error:', err);
        }
      });
  }

  onResendOTP() {
    this.resendOTPLoading = true;
    this.resendOTPMessage = '';
    this.errorMessage = '';

    this.authService.resendOTP(this.userEmail)
      .subscribe({
        next: (res: any) => {
          this.resendOTPLoading = false;
          this.resendOTPMessage = res.message || 'OTP resent to your email.';
          this.toastService.success(res.message || 'OTP resent to your email.');
          this.otpForm.reset();
        },
        error: (err) => {
          this.resendOTPLoading = false;
          this.errorMessage = err.error?.message || 'Failed to resend OTP. Please try again.';
          this.toastService.error(err.error?.message || 'Failed to resend OTP. Please try again.');
          console.error('Resend OTP error:', err);
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
