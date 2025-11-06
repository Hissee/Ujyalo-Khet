import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../services/farmer.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationDialogService } from '../services/confirmation-dialog.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Endpoint } from '../const/end-point';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent implements OnInit {
  user: any = null;
  loading = false;
  loadingProfile = false;
  error: string | null = null;
  successMessage: string = '';
  activeTab: 'edit' | 'delete' | 'deactivate' = 'edit';

  // Edit Account
  profileData = {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    province: '',
    city: '',
    street: ''
  };

  // Change Password
  passwordChangeForm!: FormGroup;
  otpRequested = false;
  requestingOTP = false;
  changingPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Delete/Deactivate Account
  deletePassword = '';
  deactivatePassword = '';
  deleting = false;
  deactivating = false;
  showDeletePassword = false;
  showDeactivatePassword = false;

  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];

  constructor(
    private farmerService: FarmerService,
    private router: Router,
    private toastService: ToastService,
    private confirmationDialog: ConfirmationDialogService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // Initialize password change form
    this.passwordChangeForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.required, this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator = (control: any) => {
    const formGroup = control as FormGroup;
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    return newPassword.value === confirmPassword.value ? null : { mismatch: true };
  };

  // Strong password validator
  strongPasswordValidator = (control: AbstractControl): ValidationErrors | null => {
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
  };

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Please login to access account settings';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.error = null;
    
    this.farmerService.getCurrentUser().subscribe({
      next: (data) => {
        this.user = data.user;
        this.profileData = {
          firstName: data.user.firstName || '',
          middleName: data.user.middleName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          province: data.user.address?.province || '',
          city: data.user.address?.city || '',
          street: data.user.address?.street || ''
        };
        this.loadingProfile = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = err.error?.message || 'Failed to load profile';
        this.toastService.error(this.error || 'Failed to load profile');
        this.loadingProfile = false;
      }
    });
  }

  switchTab(tab: 'edit' | 'delete' | 'deactivate'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = '';
    this.deletePassword = '';
    this.deactivatePassword = '';
    this.otpRequested = false;
    this.passwordChangeForm.reset();
  }

  // Edit Account Functions
  saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = '';

    this.farmerService.updateProfile(this.profileData).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success('Profile updated successfully!', 1500);
        
        // Update localStorage with new user data
        if (this.user) {
          this.user = {
            ...this.user,
            firstName: this.profileData.firstName,
            middleName: this.profileData.middleName,
            lastName: this.profileData.lastName,
            phone: this.profileData.phone,
            address: {
              province: this.profileData.province,
              city: this.profileData.city,
              street: this.profileData.street
            }
          };
          localStorage.setItem('user', JSON.stringify(this.user));
        }

        // Redirect to landing page after toast duration
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error = err.error?.message || 'Failed to update profile';
        this.toastService.error(this.error || 'Failed to update profile');
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.profileData.firstName.trim()) {
      this.error = 'First name is required';
      return false;
    }
    if (!this.profileData.lastName.trim()) {
      this.error = 'Last name is required';
      return false;
    }
    if (!this.profileData.phone.trim()) {
      this.error = 'Phone number is required';
      return false;
    }
    if (!/^[0-9]{10}$/.test(this.profileData.phone)) {
      this.error = 'Phone number must be 10 digits';
      return false;
    }
    if (!this.profileData.province.trim()) {
      this.error = 'Province is required';
      return false;
    }
    if (!this.profileData.city.trim()) {
      this.error = 'City is required';
      return false;
    }
    if (!this.profileData.street.trim()) {
      this.error = 'Street address is required';
      return false;
    }
    return true;
  }

  // Change Password Functions
  requestPasswordChangeOTP(): void {
    // Clear form data before requesting OTP
    this.passwordChangeForm.reset();
    
    this.requestingOTP = true;
    this.error = null;
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(Endpoint.REQUEST_PASSWORD_CHANGE_OTP, {}, { headers }).subscribe({
      next: (response: any) => {
        this.requestingOTP = false;
        this.otpRequested = true;
        const message = response.message || 'OTP has been sent to your email. Please check your inbox.';
        this.toastService.success(message);
        
        // Ensure form is reset after OTP is sent
        setTimeout(() => {
          this.passwordChangeForm.reset();
        }, 100);
      },
      error: (err) => {
        console.error('Error requesting password change OTP:', err);
        this.error = err.error?.message || 'Failed to send OTP. Please try again.';
        this.toastService.error(this.error || 'Failed to send OTP. Please try again.');
        this.requestingOTP = false;
      }
    });
  }

  changePasswordWithOTP(): void {
    if (this.passwordChangeForm.invalid) {
      this.passwordChangeForm.markAllAsTouched();
      this.error = 'Please fill all fields correctly';
      return;
    }

    const formValue = this.passwordChangeForm.value;

    // Validation is handled by the form validators, but we check for mismatch here
    if (formValue.newPassword !== formValue.confirmPassword) {
      this.error = 'New password and confirm password do not match';
      return;
    }

    this.changingPassword = true;
    this.error = null;
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(Endpoint.CHANGE_PASSWORD_WITH_OTP, {
      otp: formValue.otp,
      newPassword: formValue.newPassword
    }, { headers }).subscribe({
      next: (response: any) => {
        this.changingPassword = false;
        this.toastService.success(response.message || 'Password changed successfully');
        this.successMessage = response.message || 'Password changed successfully';
        
        // Reset form
        this.otpRequested = false;
        this.passwordChangeForm.reset();

        // Clear messages after 3 seconds
        setTimeout(() => {
          this.error = null;
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.error = err.error?.message || 'Failed to change password. Please check your OTP and try again.';
        this.toastService.error(this.error || 'Failed to change password. Please check your OTP and try again.');
        this.changingPassword = false;
      }
    });
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleDeletePasswordVisibility() {
    this.showDeletePassword = !this.showDeletePassword;
  }

  toggleDeactivatePasswordVisibility() {
    this.showDeactivatePassword = !this.showDeactivatePassword;
  }

  // Delete Account Functions
  async deleteAccount(): Promise<void> {
    if (!this.deletePassword) {
      this.error = 'Please enter your password to delete your account';
      return;
    }

    const confirmed = await this.confirmationDialog.show(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone. All your data will be lost.',
      'Delete Account',
      'Cancel'
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.error = null;
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(Endpoint.DELETE_ACCOUNT, { password: this.deletePassword }, { headers }).subscribe({
      next: (response: any) => {
        this.deleting = false;
        this.toastService.success(response.message || 'Account deleted successfully');
        
        // Clear localStorage and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        this.error = err.error?.message || 'Failed to delete account';
        this.toastService.error(this.error || 'Failed to delete account');
        this.deleting = false;
      }
    });
  }

  // Deactivate Account Functions
  async deactivateAccount(): Promise<void> {
    if (!this.deactivatePassword) {
      this.error = 'Please enter your password to deactivate your account';
      return;
    }

    const confirmed = await this.confirmationDialog.show(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? You can reactivate it by logging in again.',
      'Deactivate Account',
      'Cancel'
    );

    if (!confirmed) {
      return;
    }

    this.deactivating = true;
    this.error = null;
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(Endpoint.DEACTIVATE_ACCOUNT, { password: this.deactivatePassword }, { headers }).subscribe({
      next: (response: any) => {
        this.deactivating = false;
        this.toastService.success(response.message || 'Account deactivated successfully');
        
        // Clear localStorage and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error deactivating account:', err);
        this.error = err.error?.message || 'Failed to deactivate account';
        this.toastService.error(this.error || 'Failed to deactivate account');
        this.deactivating = false;
      }
    });
  }

  cancel(): void {
    // Route to dashboard if farmer, otherwise home
    if (this.user?.role === 'farmer') {
      this.router.navigate(['/farmer-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getFullName(): string {
    if (!this.user) return '';
    const parts = [this.user.firstName];
    if (this.user.middleName) parts.push(this.user.middleName);
    parts.push(this.user.lastName);
    return parts.join(' ');
  }
}

