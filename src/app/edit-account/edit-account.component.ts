import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService } from '../services/farmer.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-edit-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-account.component.html',
  styleUrl: './edit-account.component.css'
})
export class EditAccountComponent implements OnInit {
  user: any = null;
  loading = false;
  loadingProfile = false;
  error: string | null = null;
  successMessage: string = '';

  profileData = {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    province: '',
    city: '',
    street: ''
  };

  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];

  constructor(
    private farmerService: FarmerService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Please login to edit your account';
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

