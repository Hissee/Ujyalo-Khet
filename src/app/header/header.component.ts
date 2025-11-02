import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  isLoggedIn: boolean = false;
  user: any = null;
  showUserMenu: boolean = false;
  notificationCount: number = 0;
  private cartSubscription: any;
  private routeSubscription: any;
  private storageHandler = () => this.checkAuthStatus();
  private clickHandler = (event: MouseEvent) => this.onDocumentClick(event);

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes to update item count
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItemCount = this.cartService.getTotalItems();
    });

    // Check authentication status
    this.checkAuthStatus();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', this.storageHandler);
    
    // Listen for clicks outside user menu to close it
    document.addEventListener('click', this.clickHandler);
    
    // Listen to route changes to update auth status
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthStatus();
      });

    // Subscribe to notification count
    this.notificationService.unreadCount$.subscribe(count => {
      this.notificationCount = count;
    });

    // Load initial notification count
    if (this.isLoggedIn) {
      this.loadNotificationCount();
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    window.removeEventListener('storage', this.storageHandler);
    document.removeEventListener('click', this.clickHandler);
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    this.isLoggedIn = !!token;
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        // Load notification count when logged in
        this.loadNotificationCount();
      } catch (e) {
        this.user = null;
      }
    } else {
      this.user = null;
      this.notificationCount = 0;
    }
  }

  loadNotificationCount(): void {
    if (this.isLoggedIn) {
      this.notificationService.getUnreadCount().subscribe({
        next: (count) => {
          this.notificationService.updateUnreadCount(count);
        },
        error: (err) => {
          console.error('Error loading notification count:', err);
        }
      });
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.cartService.clearCart(); // Clear cart on logout
    this.isLoggedIn = false;
    this.user = null;
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  navigateToDashboard(): void {
    if (this.user?.role === 'farmer') {
      this.router.navigate(['/farmer-dashboard']);
    } else if (this.user?.role === 'consumer' || this.user?.role === 'customer') {
      // Navigate to consumer dashboard if exists, or home
      this.router.navigate(['/']);
    }
    this.showUserMenu = false;
  }

  navigateToEditAccount(): void {
    // Both farmers and consumers use the same edit-account route
    this.router.navigate(['/edit-account']);
    this.showUserMenu = false;
  }

  confirmAndLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.logout();
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // Close menu when clicking outside
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  }
}
