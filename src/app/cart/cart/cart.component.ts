import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { CartService } from '../cart.service';
import { ICartItem } from '../Icart-item';
import { ToastService } from '../../services/toast.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: ICartItem[] = [];
  totalItems: number = 0;
  totalPrice: number = 0;
  private cartSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;
  private paymentProcessed: boolean = false; // Flag to prevent multiple processing

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private confirmationDialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });

    // Check for eSewa payment callback
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      // Prevent multiple processing of the same payment callback
      if (this.paymentProcessed) {
        return;
      }
      
      // eSewa sends response as Base64 encoded data
      // Check for 'data' parameter (most common) or any Base64-like parameter
      let base64Data = params['data'] || params['response'] || params['q'];
      
      // Handle malformed URL where eSewa sends ?status=success?data=... instead of &data=...
      // In this case, Angular may parse status as "success?data=..." (embedded)
      if (!base64Data && params['status'] && typeof params['status'] === 'string') {
        const statusValue = params['status'];
        if (statusValue.includes('data=')) {
          const embeddedMatch = statusValue.match(/data=([^&?#]+)/);
          if (embeddedMatch && embeddedMatch[1]) {
            base64Data = embeddedMatch[1];
          }
        }
      }
      
      // If still not found, extract from full URL
      if (!base64Data) {
        // Get the full URL and decode it
        const fullUrl = window.location.href;
        const decodedUrl = decodeURIComponent(fullUrl);
        
        // Try multiple patterns to extract the data parameter
        // Pattern 1: Standard ?data= or &data=
        let dataMatch = decodedUrl.match(/[?&]data=([^&?#]+)/);
        
        // Pattern 2: Direct search in the entire URL string for Base64-like data
        if (!dataMatch) {
          const directMatch = decodedUrl.match(/data=([A-Za-z0-9+/=]+)/);
          if (directMatch) {
            dataMatch = directMatch;
          }
        }
        
        if (dataMatch && dataMatch[1]) {
          base64Data = dataMatch[1];
          // Remove any trailing fragments, additional parameters, or URL encoding artifacts
          base64Data = base64Data.split('&')[0].split('#')[0];
          // Clean up any remaining URL encoding (but keep = for Base64 padding)
          base64Data = base64Data.replace(/%3D/g, '=').trim();
        }
      }
      
      if (base64Data && this.isBase64(base64Data)) {
        const response = this.decodeBase64Response(base64Data);
        
        if (response && response.status) {
          // Verify signature
          const isValidSignature = this.verifyEsewaResponse(response);
          
          if (isValidSignature && response.status === 'COMPLETE') {
            // Mark as processed to prevent duplicate execution
            this.paymentProcessed = true;
            
            // Clear cart on successful payment with valid signature
            this.cartService.clearCart();
            
            // Show success toast message with longer duration (5 seconds)
            this.toastService.success('Payment successful! Your order has been placed.', 5000);
            
            // Use location.replace to update URL without navigation (preserves toast)
            // This removes query parameters from URL without reinitializing component
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
            
            // Reset flag after a delay
            setTimeout(() => {
              this.paymentProcessed = false;
            }, 2000);
          } else if (response.status === 'COMPLETE' && !isValidSignature) {
            // Signature verification failed - don't clear cart
            this.toastService.error('Payment verification failed. Please contact support.');
            this.router.navigate(['/cart'], { replaceUrl: true });
          } else {
            // Payment failed, pending, or other status - keep cart items
            const statusMessage = this.getStatusMessage(response.status);
            this.toastService.error(statusMessage);
            this.router.navigate(['/cart'], { replaceUrl: true });
          }
        } else {
          // Failed to decode response or invalid format
          this.toastService.error('Invalid payment response. Please try again.');
          this.router.navigate(['/cart'], { replaceUrl: true });
        }
      } else if (params['status'] === 'success' || params['status'] === 'COMPLETE') {
        // Mark as processed to prevent duplicate execution
        this.paymentProcessed = true;
        
        // Fallback for simple success parameter
        this.cartService.clearCart();
        // Show success toast message with longer duration (5 seconds)
        this.toastService.success('Payment successful! Your order has been placed.', 5000);
        
        // Use location.replace to update URL without navigation (preserves toast)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        
        // Reset flag after a delay
        setTimeout(() => {
          this.paymentProcessed = false;
        }, 2000);
      } else if (params['status'] === 'failure' || params['status'] === 'CANCELED' || params['status'] === 'NOT_FOUND') {
        // Fallback for simple failure parameter
        this.toastService.error('Payment failed. Please try again.');
        this.router.navigate(['/cart'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  updateTotals(): void {
    this.totalItems = this.cartService.getTotalItems();
    this.totalPrice = this.cartService.getTotalPrice();
  }

  updateQuantity(productId: string | number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    
    if (!isNaN(quantity) && quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  incrementQuantity(item: ICartItem): void {
    const newQuantity = item.quantity + 1;
    if (newQuantity <= item.product.quantity) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
      this.toastService.info(`Updated ${item.product.name} quantity to ${newQuantity}`);
    } else {
      this.toastService.warning(`Maximum available quantity is ${item.product.quantity}`);
    }
  }

  decrementQuantity(item: ICartItem): void {
    const newQuantity = item.quantity - 1;
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
      this.toastService.info(`Updated ${item.product.name} quantity to ${newQuantity}`);
    } else {
      this.removeItem(item.product.id);
    }
  }

  async removeItem(productId: string | number): Promise<void> {
    const item = this.cartItems.find(i => i.product.id === productId || i.product._id === productId);
    const productName = item?.product.name || 'Item';
    
    const confirmed = await this.confirmationDialog.show(
      'Remove Item',
      `Are you sure you want to remove ${productName} from cart?`,
      'Remove',
      'Cancel'
    );
    
    if (confirmed) {
      this.cartService.removeFromCart(productId);
      this.toastService.success(`${productName} removed from cart`);
    }
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.confirmationDialog.show(
      'Clear Cart',
      'Are you sure you want to clear the entire cart? This action cannot be undone.',
      'Clear Cart',
      'Cancel'
    );
    
    if (confirmed) {
      this.cartService.clearCart();
      this.toastService.success('Cart cleared successfully');
    }
  }

  continueShopping(): void {
    this.router.navigate(['/product-list']);
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      this.toastService.warning('Your cart is empty!');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getItemTotal(item: ICartItem): number {
    return item.product.price * item.quantity;
  }

  /**
   * Get user-friendly message for eSewa payment status
   */
  private getStatusMessage(status: string): string {
    const statusMessages: { [key: string]: string } = {
      'PENDING': 'Payment is pending. Please wait for confirmation.',
      'COMPLETE': 'Payment successful! Your order has been placed.',
      'FULL_REFUND': 'Payment has been fully refunded.',
      'PARTIAL_REFUND': 'Payment has been partially refunded.',
      'AMBIGUOUS': 'Payment status is unclear. Please contact support.',
      'NOT_FOUND': 'Payment session expired. Please try again.',
      'CANCELED': 'Payment was canceled. Please try again.'
    };
    
    return statusMessages[status] || 'Payment failed. Please try again.';
  }

  /**
   * Generate a unique transaction UUID for eSewa payment
   */
  private generateTransactionUUID(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * Generate eSewa payment signature using HMAC SHA256
   * Similar to backend implementation: creates hash from signed fields
   */
  private generateEsewaSignature(
    totalAmount: string,
    transactionUUID: string,
    productCode: string
  ): string {
    // Create message string in format: total_amount=value,transaction_uuid=value,product_code=value
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${productCode}`;
    
    // Generate HMAC SHA256 hash using eSewa secret
    const hash = CryptoJS.HmacSHA256(message, environment.esewaSecret);
    
    // Convert hash to Base64 string
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    
    return hashInBase64;
  }

  /**
   * Generate eSewa response signature for verification
   * Used to verify the response from eSewa after payment
   */
  private generateEsewaResponseSignature(
    transactionCode: string,
    status: string,
    totalAmount: string,
    transactionUUID: string,
    productCode: string,
    signedFieldNames: string
  ): string {
    // Create message string from signed fields in order
    const message = `transaction_code=${transactionCode},status=${status},total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${productCode},signed_field_names=${signedFieldNames}`;
    
    // Generate HMAC SHA256 hash using eSewa secret
    const hash = CryptoJS.HmacSHA256(message, environment.esewaSecret);
    
    // Convert hash to Base64 string
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    
    return hashInBase64;
  }

  /**
   * Check if string is Base64 encoded
   */
  private isBase64(str: string): boolean {
    try {
      // Base64 strings typically contain A-Z, a-z, 0-9, +, /, and = for padding
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(str) && str.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Decode Base64 string to JSON object
   */
  private decodeBase64Response(base64String: string): any {
    try {
      // Handle URL-safe Base64 encoding (replace - with + and _ with /)
      const normalized = base64String.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding Base64 response:', error);
      return null;
    }
  }

  /**
   * Verify eSewa payment response signature
   */
  private verifyEsewaResponse(response: any): boolean {
    try {
      const generatedSignature = this.generateEsewaResponseSignature(
        response.transaction_code,
        response.status,
        response.total_amount.toString(),
        response.transaction_uuid,
        response.product_code,
        response.signed_field_names
      );
      
      return generatedSignature === response.signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Pay with eSewa - Creates and submits form to eSewa payment gateway
   */
  payWithEsewa(): void {
    if (this.cartItems.length === 0 || this.totalPrice <= 0) {
      this.toastService.warning('Your cart is empty!');
      return;
    }

    // Generate unique transaction UUID
    const transactionUUID = this.generateTransactionUUID();
    
    // Calculate amounts
    const amount = this.totalPrice.toFixed(2);
    const taxAmount = '0';
    const totalAmount = this.totalPrice.toFixed(2);
    
    // Get base URL for success/failure URLs
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/cart?status=success`;
    const failureUrl = `${baseUrl}/cart?status=failure`;
    
    // Product code for eSewa
    const productCode = 'EPAYTEST'; // Change this to your actual product code
    
    // Generate signature using HMAC SHA256
    const signature = this.generateEsewaSignature(totalAmount, transactionUUID, productCode);
    
    // eSewa payment form data
    const formData = {
      amount: amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUUID,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature
    };

    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    form.style.display = 'none';

    // Add form fields
    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key as keyof typeof formData];
      form.appendChild(input);
    });

    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
  }
}
