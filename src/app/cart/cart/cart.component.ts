import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ICartItem } from '../Icart-item';
import { ToastService } from '../../services/toast.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

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
  private cartSubscription: any;

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    private confirmationDialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
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
}
