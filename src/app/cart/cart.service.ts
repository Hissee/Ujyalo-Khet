import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProduct } from '../product/Iproduct';
import { ICartItem } from './Icart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: ICartItem[] = [];
  private cartSubject = new BehaviorSubject<ICartItem[]>([]);
  public cart$: Observable<ICartItem[]> = this.cartSubject.asObservable();

  constructor() {
    // Load cart from localStorage on initialization
    this.loadCartFromStorage();
  }

  // Add product to cart
  addToCart(product: IProduct, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Update quantity if product already exists
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= product.quantity) {
        existingItem.quantity = newQuantity;
      } else {
        // Limit to available quantity
        existingItem.quantity = product.quantity;
        console.warn(`Maximum available quantity is ${product.quantity}`);
      }
    } else {
      // Add new item to cart
      const quantityToAdd = quantity <= product.quantity ? quantity : product.quantity;
      this.cartItems.push({
        product: product,
        quantity: quantityToAdd
      });
    }
    
    this.updateCart();
  }

  // Remove item from cart
  removeFromCart(productId: string | number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCart();
  }

  // Update item quantity
  updateQuantity(productId: string | number, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.product.quantity) {
        item.quantity = quantity;
        this.updateCart();
      } else {
        console.warn(`Maximum available quantity is ${item.product.quantity}`);
        item.quantity = item.product.quantity;
        this.updateCart();
      }
    }
  }

  // Get cart items
  getCartItems(): ICartItem[] {
    return [...this.cartItems];
  }

  // Get total items count
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Get total price
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Clear cart
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  // Update cart and save to localStorage
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  // Save cart to localStorage
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Load cart from localStorage
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next([...this.cartItems]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.cartItems = [];
    }
  }

  // Check if product is in cart
  isInCart(productId: string | number): boolean {
    return this.cartItems.some(item => item.product.id === productId);
  }

  // Get quantity of a product in cart
  getQuantity(productId: string | number): number {
    const item = this.cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}

