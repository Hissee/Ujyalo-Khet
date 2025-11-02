import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  refreshing = false;
  private refreshInterval: any;

  constructor(
    private orderService: OrderService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    // Auto-refresh orders every 30 seconds to show status updates
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (!this.loading && !this.refreshing) {
        this.refreshOrders(true); // Silent refresh
      }
    }, 30000); // Refresh every 30 seconds
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        // Sort by date (newest first)
        this.orders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = err.error?.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  refreshOrders(showLoading: boolean = false): void {
    if (showLoading) {
      this.refreshing = true;
    }

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        // Check if any order status changed
        const statusChanged = this.hasStatusChanged(this.orders, orders);
        
        this.orders = orders;
        // Sort by date (newest first)
        this.orders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        this.refreshing = false;
        
        if (statusChanged && showLoading) {
          // Show a subtle notification that orders were updated
          console.log('Order status updated');
        }
      },
      error: (err) => {
        console.error('Error refreshing orders:', err);
        this.refreshing = false;
      }
    });
  }

  private hasStatusChanged(oldOrders: Order[], newOrders: Order[]): boolean {
    if (oldOrders.length !== newOrders.length) return true;
    
    for (let i = 0; i < oldOrders.length; i++) {
      const oldOrder = oldOrders[i];
      const newOrder = newOrders.find(o => o._id === oldOrder._id);
      
      if (!newOrder) return true;
      
      if (oldOrder.status !== newOrder.status || 
          oldOrder.paymentStatus !== newOrder.paymentStatus) {
        return true;
      }
    }
    
    return false;
  }

  viewOrderDetail(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'confirmed':
        return 'bg-info';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bi-hourglass-split';
      case 'confirmed':
        return 'bi-check-circle';
      case 'processing':
        return 'bi-gear';
      case 'shipped':
        return 'bi-truck';
      case 'delivered':
        return 'bi-check-circle-fill';
      case 'cancelled':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  getPaymentStatusBadgeClass(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getPaymentStatusIcon(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'bi-check-circle-fill';
      case 'pending':
        return 'bi-clock';
      case 'failed':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
    }
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
