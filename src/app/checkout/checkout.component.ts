import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { OrderService, OrderRequest } from '../services/order.service';
import { ICartItem } from '../cart/Icart-item';

declare var KhaltiCheckout: any;

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: ICartItem[] = [];
  totalPrice: number = 0;
  paymentMethod: 'cash_on_delivery' | 'khalti' = 'cash_on_delivery';
  
  // Delivery address form
  deliveryAddress = {
    province: '',
    city: '',
    street: '',
    phone: ''
  };

  loading: boolean = false;
  error: string | null = null;
  private cartSubscription: any;

  // Khalti configuration (use test credentials for development)
  // To get your keys: https://khalti.com/merchant
  // Test Public Key: Use the test key from Khalti dashboard
  // Production: Replace with your actual public key from Khalti merchant account
  private khaltiConfig = {
    publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a390234', // TODO: Replace with your actual Khalti public key
    productIdentity: '',
    productName: '',
    productUrl: '',
    eventHandler: this.onKhaltiPayment.bind(this),
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT']
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
      
      if (this.cartItems.length === 0) {
        // Redirect to cart if empty
        this.router.navigate(['/cart']);
      }
    });

    // Load delivery address from localStorage if available
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      try {
        this.deliveryAddress = { ...this.deliveryAddress, ...JSON.parse(savedAddress) };
      } catch (e) {
        console.error('Error loading saved address:', e);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  placeOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.paymentMethod === 'cash_on_delivery') {
      this.placeCashOnDeliveryOrder();
    } else if (this.paymentMethod === 'khalti') {
      this.initiateKhaltiPayment();
    }
  }

  private validateForm(): boolean {
    if (!this.deliveryAddress.province.trim()) {
      this.error = 'Please enter province';
      return false;
    }
    if (!this.deliveryAddress.city.trim()) {
      this.error = 'Please enter city';
      return false;
    }
    if (!this.deliveryAddress.street.trim()) {
      this.error = 'Please enter street address';
      return false;
    }
    if (!this.deliveryAddress.phone.trim()) {
      this.error = 'Please enter phone number';
      return false;
    }
    return true;
  }

  private placeCashOnDeliveryOrder(): void {
    const orderData: OrderRequest = {
      products: this.cartItems.map(item => ({
        productId: String(item.product.id),
        quantity: item.quantity
      })),
      deliveryAddress: {
        province: this.deliveryAddress.province,
        city: this.deliveryAddress.city,
        street: this.deliveryAddress.street,
        phone: this.deliveryAddress.phone
      },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending'
    };

    this.orderService.placeOrder(orderData).subscribe({
      next: (response) => {
        // Save address for future use
        localStorage.setItem('deliveryAddress', JSON.stringify(this.deliveryAddress));
        
        // Clear cart
        this.cartService.clearCart();
        
        // Show success and redirect
        alert('Order placed successfully! Order ID: ' + response.orderId);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Order error:', err);
        this.error = err.error?.message || 'Failed to place order. Please try again.';
        this.loading = false;
      }
    });
  }

  private initiateKhaltiPayment(): void {
    // Prepare order first to get order ID
    const orderData: OrderRequest = {
      products: this.cartItems.map(item => ({
        productId: String(item.product.id),
        quantity: item.quantity
      })),
      deliveryAddress: {
        province: this.deliveryAddress.province,
        city: this.deliveryAddress.city,
        street: this.deliveryAddress.street,
        phone: this.deliveryAddress.phone
      },
      paymentMethod: 'khalti',
      paymentStatus: 'pending'
    };

    // First, create the order
    this.orderService.placeOrder(orderData).subscribe({
      next: (orderResponse) => {
        // Initialize Khalti checkout
        this.khaltiConfig.productIdentity = orderResponse.orderId;
        this.khaltiConfig.productName = 'UjyaloKhet Order';
        this.khaltiConfig.productUrl = window.location.origin;

        const checkout = new KhaltiCheckout(this.khaltiConfig);
        
        // Show Khalti payment widget
        checkout.show({ amount: this.totalPrice * 100 }); // Khalti expects amount in paisa (multiply by 100)
      },
      error: (err) => {
        console.error('Order creation error:', err);
        this.error = err.error?.message || 'Failed to create order. Please try again.';
        this.loading = false;
      }
    });
  }

  private onKhaltiPayment(e: any): void {
    console.log('Khalti payment event:', e);

    if (e.event === 'CLOSED') {
      // Payment window closed
      this.loading = false;
      this.error = 'Payment was cancelled. Please try again.';
      return;
    }

    if (e.event === 'SUCCESS') {
      // Payment successful - verify payment
      this.verifyKhaltiPayment(e);
    }

    if (e.event === 'ERROR') {
      // Payment failed
      this.error = 'Payment failed. Please try again.';
      this.loading = false;
    }
  }

  private verifyKhaltiPayment(paymentData: any): void {
    this.orderService.verifyKhaltiPayment({
      token: paymentData.token,
      amount: paymentData.amount,
      orderId: this.khaltiConfig.productIdentity
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Save address
          localStorage.setItem('deliveryAddress', JSON.stringify(this.deliveryAddress));
          
          // Clear cart
          this.cartService.clearCart();
          
          // Show success and redirect
          alert('Payment successful! Order ID: ' + response.orderId);
          this.router.navigate(['/']);
        } else {
          this.error = response.message || 'Payment verification failed';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Payment verification error:', err);
        this.error = err.error?.message || 'Payment verification failed. Please contact support.';
        this.loading = false;
      }
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
