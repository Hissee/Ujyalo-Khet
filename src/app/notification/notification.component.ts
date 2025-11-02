import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../services/notification.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  error: string | null = null;
  refreshInterval?: Subscription;

  constructor(
    private notificationService: NotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    // Auto-refresh every 30 seconds
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadNotifications(true);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  loadNotifications(silent: boolean = false): void {
    if (!silent) {
      this.loading = true;
    }
    this.error = null;

    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Most recent first
        });
        // Update unread count
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationService.updateUnreadCount(unreadCount);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.read) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.read = true;
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationService.updateUnreadCount(unreadCount);
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.notificationService.updateUnreadCount(0);
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
      }
    });
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n._id !== notificationId);
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationService.updateUnreadCount(unreadCount);
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'order_placed':
        return 'bi-cart-plus';
      case 'order_confirmed':
        return 'bi-check-circle';
      case 'order_processing':
        return 'bi-arrow-repeat';
      case 'order_loaded':
        return 'bi-box-seam';
      case 'order_delivered':
        return 'bi-truck';
      case 'order_payment_completed':
        return 'bi-credit-card';
      default:
        return 'bi-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'order_placed':
        return 'text-primary';
      case 'order_confirmed':
        return 'text-success';
      case 'order_processing':
        return 'text-info';
      case 'order_loaded':
        return 'text-warning';
      case 'order_delivered':
        return 'text-success';
      case 'order_payment_completed':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  }

  navigateToOrder(orderId?: string): void {
    if (orderId) {
      this.router.navigate(['/orders', orderId]);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

