import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { OrderService, OrderRequest } from '../services/order.service';
import { ICartItem } from '../cart/Icart-item';
import { Endpoint } from '../const/end-point';
import { ToastService } from '../services/toast.service';

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
  
  provinces: string[] = [
    'Gandaki', 'Bagmati', 'Madesh', 'Lumbini', 'Karnali', 'Koshi', 'Sudurpaschim'
  ];
  
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
    private router: Router,
    private toastService: ToastService
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

  // Format error message for display (replace newlines with HTML breaks)
  getFormattedError(): string {
    if (!this.error) return '';
    return this.error.replace(/\n/g, '<br>');
  }

  canPlaceOrder(): boolean {
    return !!(
      this.deliveryAddress.province?.trim() &&
      this.deliveryAddress.city?.trim() &&
      this.deliveryAddress.street?.trim() &&
      this.deliveryAddress.phone?.trim() &&
      this.cartItems.length > 0 &&
      !this.loading
    );
  }

  placeOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.error('Please login to place an order.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Check if cart is empty
    if (this.cartItems.length === 0) {
      this.toastService.warning('Your cart is empty. Please add products to cart.');
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
    if (!this.deliveryAddress.province?.trim()) {
      this.toastService.error('Please select a province');
      return false;
    }
    if (!this.deliveryAddress.city?.trim()) {
      this.toastService.error('Please enter city');
      return false;
    }
    if (!this.deliveryAddress.street?.trim()) {
      this.toastService.error('Please enter street address');
      return false;
    }
    if (!this.deliveryAddress.phone?.trim()) {
      this.toastService.error('Please enter phone number');
      return false;
    }
    
    // Validate phone number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(this.deliveryAddress.phone.trim())) {
      this.toastService.error('Phone number must be exactly 10 digits');
      return false;
    }
    
    return true;
  }

  // Validate MongoDB ObjectId format (24 hex characters)
  private isValidObjectId(id: string | number | undefined | null): boolean {
    if (!id) return false;
    const idStr = String(id);
    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(idStr);
  }

  private placeCashOnDeliveryOrder(): void {
    try {
      // Validate product IDs before sending
      const invalidProducts = this.cartItems.filter(item => {
        const productId = item.product._id || item.product.id;
        if (!productId || productId === 'undefined' || productId === 'null') {
          return true;
        }
        // Check if it's a valid MongoDB ObjectId format
        return !this.isValidObjectId(productId);
      });

      if (invalidProducts.length > 0) {
        const productNames = invalidProducts.map(item => item.product.name).join(', ');
        this.error = `Invalid product IDs in cart: ${productNames}. Please remove these items and try again.`;
        this.loading = false;
        console.error('Invalid products:', invalidProducts);
        return;
      }

      // Validate cart is not empty
      if (this.cartItems.length === 0) {
        this.error = 'Your cart is empty. Please add products before placing an order.';
        this.loading = false;
        return;
      }

      // Use _id if available, otherwise use id - ensure it's a string
      const orderData: OrderRequest = {
        products: this.cartItems.map(item => {
          const productId = item.product._id || String(item.product.id);
          if (!this.isValidObjectId(productId)) {
            throw new Error(`Invalid product ID format: ${productId} for product ${item.product.name}`);
          }
          return {
            productId: String(productId), // Ensure it's a string
            quantity: item.quantity
          };
        }),
        deliveryAddress: {
          province: this.deliveryAddress.province.trim(),
          city: this.deliveryAddress.city.trim(),
          street: this.deliveryAddress.street.trim(),
          phone: this.deliveryAddress.phone.trim()
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending'
      };

      console.log('✅ Placing order with validated data:');
      console.log('Order Data:', JSON.stringify(orderData, null, 2));
      console.log('Cart Items:', this.cartItems);
      console.log('User Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      this.orderService.placeOrder(orderData).subscribe({
        next: (response) => {
          console.log('✅ Order placed successfully!', response);
          this.loading = false;
          this.error = null;
          
          // Save address for future use
          localStorage.setItem('deliveryAddress', JSON.stringify(this.deliveryAddress));
          
          // Clear cart
          this.cartService.clearCart();
          
          // Show success toast
          const orderId = response.orderId || 'N/A';
          this.toastService.success(`Order placed successfully! Order ID: ${orderId}. You will receive a confirmation shortly.`);
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
        console.error('Order error:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url,
          headers: err.headers
        });
        
        // Log the full error for debugging
        if (err.error) {
          console.error('Server error response:', JSON.stringify(err.error, null, 2));
        }
        
        this.loading = false;
        
        // Better error handling with more detailed messages
        if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check if the server is running.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (err.status === 400) {
          const serverMessage = err.error?.message || err.error?.error || 'Invalid order data';
          this.error = `Validation error: ${serverMessage}. Please check your cart and delivery address.`;
        } else if (err.status === 500) {
          // Extract detailed error message - try multiple ways
          let serverMessage = 'Internal server error occurred';
          let errorDetails = '';
          
          if (err.error) {
            if (typeof err.error === 'string') {
              serverMessage = err.error;
            } else if (err.error.error) {
              // Backend returns { message: "Server error", error: "actual error message" }
              serverMessage = err.error.error || err.error.message || 'Server error';
              errorDetails = err.error.details || '';
            } else if (err.error.message) {
              serverMessage = err.error.message;
            } else {
              serverMessage = JSON.stringify(err.error);
            }
          }
          
          // Log full error for debugging
          console.error('=== SERVER ERROR DETAILS (Cash on Delivery) ===');
          console.error('HTTP Status:', err.status);
          console.error('Status Text:', err.statusText);
          console.error('Full error object:', err);
          console.error('Error response body:', err.error);
          console.error('Error response (JSON):', JSON.stringify(err.error, null, 2));
          console.error('Request URL:', err.url || Endpoint.PLACE_ORDER);
          console.error('Request method: POST');
          console.error('');
          console.error('--- ORDER DATA THAT WAS SENT ---');
          console.error(JSON.stringify(orderData, null, 2));
          console.error('');
          console.error('--- CART ITEMS DETAILS ---');
          this.cartItems.forEach((item, index) => {
            console.error(`Item ${index + 1}:`, {
              productId: item.product._id || item.product.id,
              productIdValid: this.isValidObjectId(item.product._id || item.product.id),
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            });
          });
          console.error('');
          console.error('--- USER AUTHENTICATION ---');
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('token');
          console.error('Token present:', !!token);
          console.error('User data:', userStr ? JSON.parse(userStr) : 'Not found');
          console.error('===============================================');
          console.error('');
          console.error('💡 TO FIX THIS ERROR:');
          console.error('1. Open Network tab (F12 → Network)');
          console.error('2. Find the POST request to /api/orders');
          console.error('3. Click it → Go to "Response" tab');
          console.error('4. Copy the error message shown there');
          console.error('5. Check backend server console for detailed logs');
          console.error('');
          
          // Show the actual error message if available
          const displayMessage = errorDetails 
            ? `${serverMessage}\n\nDetails: ${errorDetails}` 
            : serverMessage;
          
          this.error = `Server Error: ${displayMessage}\n\nCheck Network tab Response for full error details.`;
        } else {
          const serverMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
          this.error = `Error ${err.status}: ${serverMessage}`;
        }
        
        // Show alert with error for visibility
        console.error('Displaying error to user:', this.error);
      }
      });
    } catch (error: any) {
      console.error('Error preparing order:', error);
      this.loading = false;
      this.error = error.message || 'Failed to prepare order. Please check your cart and try again.';
    }
  }

  private initiateKhaltiPayment(): void {
    // Validate product IDs before sending
    const invalidProducts = this.cartItems.filter(item => {
      const productId = item.product._id || item.product.id;
      if (!productId || productId === 'undefined' || productId === 'null') {
        return true;
      }
      // Check if it's a valid MongoDB ObjectId format
      return !this.isValidObjectId(productId);
    });

    if (invalidProducts.length > 0) {
      const productNames = invalidProducts.map(item => item.product.name).join(', ');
      this.error = `Invalid product IDs in cart: ${productNames}. Please remove these items and try again.`;
      this.loading = false;
      console.error('Invalid products:', invalidProducts);
      return;
    }

    // Prepare order first to get order ID
    // Use _id if available, otherwise use id - ensure it's a string
    const orderData: OrderRequest = {
      products: this.cartItems.map(item => {
        const productId = item.product._id || String(item.product.id);
        if (!this.isValidObjectId(productId)) {
          throw new Error(`Invalid product ID format: ${productId} for product ${item.product.name}`);
        }
        return {
          productId: String(productId), // Ensure it's a string
          quantity: item.quantity
        };
      }),
      deliveryAddress: {
        province: this.deliveryAddress.province.trim(),
        city: this.deliveryAddress.city.trim(),
        street: this.deliveryAddress.street.trim(),
        phone: this.deliveryAddress.phone.trim()
      },
      paymentMethod: 'khalti',
      paymentStatus: 'pending'
    };

    console.log('Placing Khalti order with data:', JSON.stringify(orderData, null, 2));
    console.log('Cart items:', this.cartItems);

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
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        
        // Log the full error for debugging
        if (err.error) {
          console.error('Server error response:', JSON.stringify(err.error, null, 2));
        }
        
        this.loading = false;
        
        // Better error handling with more detailed messages
        if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check if the server is running.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (err.status === 400) {
          const serverMessage = err.error?.message || err.error?.error || 'Invalid order data';
          this.error = `Validation error: ${serverMessage}. Please check your cart and delivery address.`;
        } else if (err.status === 500) {
          // Extract detailed error message - try multiple ways
          let serverMessage = 'Internal server error occurred';
          let errorDetails = '';
          
          if (err.error) {
            if (typeof err.error === 'string') {
              serverMessage = err.error;
            } else if (err.error.error) {
              // Backend returns { message: "Server error", error: "actual error message" }
              serverMessage = err.error.error || err.error.message || 'Server error';
              errorDetails = err.error.details || '';
            } else if (err.error.message) {
              serverMessage = err.error.message;
            } else {
              serverMessage = JSON.stringify(err.error);
            }
          }
          
          // Log full error for debugging
          console.error('=== SERVER ERROR DETAILS (Khalti) ===');
          console.error('HTTP Status:', err.status);
          console.error('Status Text:', err.statusText);
          console.error('Full error object:', err);
          console.error('Error response body:', err.error);
          console.error('Error response (JSON):', JSON.stringify(err.error, null, 2));
          console.error('Request URL:', err.url || Endpoint.PLACE_ORDER);
          console.error('Request method: POST');
          console.error('');
          console.error('--- ORDER DATA THAT WAS SENT ---');
          console.error(JSON.stringify(orderData, null, 2));
          console.error('');
          console.error('--- CART ITEMS DETAILS ---');
          this.cartItems.forEach((item, index) => {
            console.error(`Item ${index + 1}:`, {
              productId: item.product._id || item.product.id,
              productIdValid: this.isValidObjectId(item.product._id || item.product.id),
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            });
          });
          console.error('');
          console.error('--- USER AUTHENTICATION ---');
          const userStr = localStorage.getItem('user');
          const token = localStorage.getItem('token');
          console.error('Token present:', !!token);
          console.error('User data:', userStr ? JSON.parse(userStr) : 'Not found');
          console.error('=====================================');
          console.error('');
          console.error('💡 TO FIX THIS ERROR:');
          console.error('1. Open Network tab (F12 → Network)');
          console.error('2. Find the POST request to /api/orders');
          console.error('3. Click it → Go to "Response" tab');
          console.error('4. Copy the error message shown there');
          console.error('5. Check backend server console for detailed logs');
          console.error('');
          
          // Show the actual error message if available
          const displayMessage = errorDetails 
            ? `${serverMessage}\n\nDetails: ${errorDetails}` 
            : serverMessage;
          
          this.error = `Server Error: ${displayMessage}\n\nCheck Network tab Response for full error details.`;
        } else {
          const serverMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
          this.error = `Error ${err.status}: ${serverMessage}`;
        }
        
        // Show alert with error for visibility
        console.error('Displaying error to user:', this.error);
      }
    });
  }

  private onKhaltiPayment(e: any): void {
    console.log('Khalti payment event:', e);

    if (e.event === 'CLOSED') {
      // Payment window closed
      this.loading = false;
      this.toastService.warning('Payment was cancelled. Please try again.');
      return;
    }

    if (e.event === 'SUCCESS') {
      // Payment successful - verify payment
      this.verifyKhaltiPayment(e);
    }

    if (e.event === 'ERROR') {
      // Payment failed
      this.toastService.error('Payment failed. Please try again.');
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
          
          // Show success toast and redirect
          this.toastService.success(`Payment successful! Order ID: ${response.orderId}. Your order has been confirmed.`);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.toastService.error(response.message || 'Payment verification failed');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Payment verification error:', err);
        this.toastService.error(err.error?.message || 'Payment verification failed. Please contact support.');
        this.loading = false;
      }
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
