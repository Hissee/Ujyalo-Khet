import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerService, DashboardStats, FarmerOrder, FarmerProduct } from '../../services/farmer.service';

@Component({
  selector: 'app-farmer-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './farmer-dashboard.component.html',
  styleUrl: './farmer-dashboard.component.css'
})
export class FarmerDashboardComponent implements OnInit {
  activeTab: 'overview' | 'orders' | 'products' | 'profile' | 'revenue' = 'overview';
  
  // Dashboard stats
  stats: DashboardStats | null = null;
  loadingStats = false;
  
  // Orders
  orders: FarmerOrder[] = [];
  loadingOrders = false;
  selectedOrder: FarmerOrder | null = null;
  newStatus = '';
  
  // Products
  products: FarmerProduct[] = [];
  loadingProducts = false;
  
  // Profile
  user: any = null;
  loadingProfile = false;
  profileEditMode = false;
  profileData = {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    province: '',
    city: '',
    street: ''
  };
  
  // Revenue
  revenueData: any = null;
  revenueDays = 30;
  loadingRevenue = false;
  
  error: string | null = null;

  constructor(
    private farmerService: FarmerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadProfile();
  }

  loadDashboardData(): void {
    this.loadingStats = true;
    this.farmerService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Failed to load dashboard data';
        this.loadingStats = false;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.farmerService.getFarmerOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loadingOrders = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders';
        this.loadingOrders = false;
      }
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.farmerService.getFarmerProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products';
        this.loadingProducts = false;
      }
    });
  }

  loadProfile(): void {
    this.loadingProfile = true;
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
        this.error = 'Failed to load profile';
        this.loadingProfile = false;
      }
    });
  }

  loadRevenue(): void {
    this.loadingRevenue = true;
    this.farmerService.getRevenue(this.revenueDays).subscribe({
      next: (data) => {
        this.revenueData = data;
        this.loadingRevenue = false;
      },
      error: (err) => {
        console.error('Error loading revenue:', err);
        this.error = 'Failed to load revenue data';
        this.loadingRevenue = false;
      }
    });
  }

  switchTab(tab: 'overview' | 'orders' | 'products' | 'profile' | 'revenue'): void {
    this.activeTab = tab;
    this.error = null;
    
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    } else if (tab === 'products' && this.products.length === 0) {
      this.loadProducts();
    } else if (tab === 'revenue') {
      this.loadRevenue();
    }
  }

  updateOrderStatus(orderId: string): void {
    if (!this.newStatus) {
      alert('Please select a status');
      return;
    }

    this.farmerService.updateOrderStatus(orderId, this.newStatus).subscribe({
      next: (response) => {
        alert('Order status updated successfully!');
        this.selectedOrder = null;
        this.newStatus = '';
        this.loadOrders();
        this.loadDashboardData(); // Refresh stats
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        alert(err.error?.message || 'Failed to update order status');
      }
    });
  }

  openOrderDetails(order: FarmerOrder): void {
    this.selectedOrder = order;
    this.newStatus = order.status;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.newStatus = '';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-warning',
      'confirmed': 'bg-info',
      'processing': 'bg-primary',
      'shipped': 'bg-secondary',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-warning',
      'completed': 'bg-success',
      'failed': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `Rs ${amount.toFixed(2)}`;
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/addproduct']);
  }

  navigateToUpdateProduct(productId: string): void {
    this.router.navigate(['/updateproduct'], { queryParams: { id: productId } });
  }

  getRevenueDates(): string[] {
    if (!this.revenueData?.revenueByDate) return [];
    return Object.keys(this.revenueData.revenueByDate).sort().reverse();
  }

  hasRevenueData(): boolean {
    return this.revenueData?.revenueByDate && Object.keys(this.revenueData.revenueByDate).length > 0;
  }

  saveProfile(): void {
    this.loadingProfile = true;
    this.farmerService.updateProfile(this.profileData).subscribe({
      next: (response) => {
        alert('Profile updated successfully!');
        this.profileEditMode = false;
        this.loadProfile(); // Reload to get updated data
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error = err.error?.message || 'Failed to update profile';
        this.loadingProfile = false;
      }
    });
  }
}
