import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ICartItem } from '../Icart-item';

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
    private router: Router
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
    } else {
      alert(`Maximum available quantity is ${item.product.quantity}`);
    }
  }

  decrementQuantity(item: ICartItem): void {
    const newQuantity = item.quantity - 1;
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
    } else {
      this.removeItem(item.product.id);
    }
  }

  removeItem(productId: string | number): void {
    if (confirm('Are you sure you want to remove this item from cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear the entire cart?')) {
      this.cartService.clearCart();
    }
  }

  continueShopping(): void {
    this.router.navigate(['/product-list']);
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getItemTotal(item: ICartItem): number {
    return item.product.price * item.quantity;
  }
}
