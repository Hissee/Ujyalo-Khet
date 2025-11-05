import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../services/farmer.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationDialogService } from '../services/confirmation-dialog.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Endpoint } from '../const/end-point';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, FormsModule],
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

  // Delete/Deactivate Account
  deletePassword = '';
  deactivatePassword = '';
  deleting = false;
  deactivating = false;

  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];

  constructor(
    private farmerService: FarmerService,
    private router: Router,
    private toastService: ToastService,
    private confirmationDialog: ConfirmationDialogService,
    private http: HttpClient
  ) {}

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

