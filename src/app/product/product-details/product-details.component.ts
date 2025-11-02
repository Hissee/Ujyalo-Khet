import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct} from '../Iproduct';
import {ProductService} from '../product.service';
import { CartService } from '../../cart/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit{

  product: IProduct | null = null;
  loading: boolean = false;
  error: string | null = null;
  orderQuantity: number = 1;
  addingToCart: boolean = false;
  placingOrder: boolean = false;
  successMessage: string = '';
  
  service = inject(ProductService);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(){
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.error = 'Product ID not found';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.service.getProductById(productId)
      .subscribe({
        next: (data) => {
          this.product = data;
          this.loading = false;
          console.log('Product loaded:', this.product);
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.error = err.error?.message || 'Failed to load product details';
          this.loading = false;
          this.product = null;
        }
      });
  }

  updateQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    if (!isNaN(quantity) && quantity > 0 && this.product) {
      if (quantity <= this.product.quantity) {
        this.orderQuantity = quantity;
      } else {
        this.orderQuantity = this.product.quantity;
        input.value = this.product.quantity.toString();
        alert(`Maximum available quantity is ${this.product.quantity}`);
      }
    }
  }

  decreaseQuantity(): void {
    if (this.orderQuantity > 1 && this.product && this.product.quantity > 0) {
      this.orderQuantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.orderQuantity < this.product.quantity) {
      this.orderQuantity++;
    }
  }

  addToCart(): void {
    if (!this.product) {
      this.error = 'Product not loaded';
      return;
    }

    if (this.orderQuantity > this.product.quantity) {
      this.error = `Cannot add ${this.orderQuantity} items. Only ${this.product.quantity} available.`;
      return;
    }

    if (this.orderQuantity <= 0) {
      this.error = 'Quantity must be at least 1';
      return;
    }

    this.addingToCart = true;
    this.error = '';
    this.successMessage = '';
    
    this.cartService.addToCart(this.product, this.orderQuantity);
    
    // Show success message
    this.successMessage = `Added ${this.orderQuantity} ${this.product.name} to cart!`;
    this.addingToCart = false;
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  placeOrder(): void {
    if (!this.product) {
      this.error = 'Product not loaded';
      return;
    }

    if (this.orderQuantity > this.product.quantity) {
      this.error = `Cannot order ${this.orderQuantity} items. Only ${this.product.quantity} available.`;
      return;
    }

    if (this.orderQuantity <= 0) {
      this.error = 'Quantity must be at least 1';
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Please login to place an order';
      // Optionally redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Option 1: Add to cart and navigate to checkout (recommended)
    this.placingOrder = true;
    this.error = '';
    this.successMessage = '';
    
    // Add product to cart first
    this.cartService.addToCart(this.product, this.orderQuantity);
    
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

}
